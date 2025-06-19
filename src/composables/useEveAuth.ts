import { ref, computed } from 'vue'
import axios from 'axios'
import CryptoJS from 'crypto-js'

// EVE SSO Configuration
const EVE_SSO_BASE_URL = 'https://login.eveonline.com'

// OAuth Configuration - you'll need to register your app at https://developers.eveonline.com/
const CLIENT_ID = import.meta.env.VITE_EVE_CLIENT_ID || 'your_client_id_here'
const REDIRECT_URI = import.meta.env.VITE_EVE_REDIRECT_URI || `${window.location.origin}/callback`

// Required scopes for character data
const SCOPES = [
  'esi-wallet.read_character_wallet.v1',
  'esi-skills.read_skills.v1',
  'esi-skills.read_skillqueue.v1',
  'esi-clones.read_clones.v1',
  'esi-characters.read_attributes.v1',
].join(' ')

interface TokenData {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  character_id: number
  character_name: string
}

interface CharacterInfo {
  character_id: number
  character_name: string
  expires_on: string
  scopes: string
  token_type: string
  character_owner_hash: string
  intellectual_property: string
}

export function useEveAuth() {
  const isAuthenticated = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const tokenData = ref<TokenData | null>(null)
  const characterInfo = ref<CharacterInfo | null>(null)

  // Generate PKCE challenge
  const generateCodeChallenge = () => {
    const codeVerifier = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64url)
    const codeChallenge = CryptoJS.SHA256(codeVerifier).toString(CryptoJS.enc.Base64url)

    sessionStorage.setItem('code_verifier', codeVerifier)
    return codeChallenge
  }

  // Generate state parameter for security
  const generateState = () => {
    const state = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex)
    sessionStorage.setItem('oauth_state', state)
    return state
  }

  // Start OAuth flow
  const login = () => {
    try {
      const codeChallenge = generateCodeChallenge()
      const state = generateState()

      const authUrl = new URL(`${EVE_SSO_BASE_URL}/v2/oauth/authorize/`)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
      authUrl.searchParams.set('client_id', CLIENT_ID)
      authUrl.searchParams.set('scope', SCOPES)
      authUrl.searchParams.set('code_challenge', codeChallenge)
      authUrl.searchParams.set('code_challenge_method', 'S256')
      authUrl.searchParams.set('state', state)

      window.location.href = authUrl.toString()
    } catch (err) {
      error.value = `Failed to start login: ${err}`
      console.error('Login error:', err)
    }
  }

  // Handle OAuth callback
  const handleCallback = async (code: string, state: string) => {
    try {
      loading.value = true
      error.value = null

      // Verify state parameter
      const savedState = sessionStorage.getItem('oauth_state')
      if (state !== savedState) {
        throw new Error('Invalid state parameter')
      }

      const codeVerifier = sessionStorage.getItem('code_verifier')
      if (!codeVerifier) {
        throw new Error('Missing code verifier')
      }

      // Exchange authorization code for access token
      const tokenResponse = await axios.post(
        `${EVE_SSO_BASE_URL}/v2/oauth/token`,
        {
          grant_type: 'authorization_code',
          code: code,
          client_id: CLIENT_ID,
          code_verifier: codeVerifier,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )

      // Verify JWT token and get character info
      const verifyResponse = await axios.get(`${EVE_SSO_BASE_URL}/oauth/verify`, {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      })

      const tokenInfo: TokenData = {
        ...tokenResponse.data,
        character_id: verifyResponse.data.CharacterID,
        character_name: verifyResponse.data.CharacterName,
      }

      const charInfo: CharacterInfo = {
        character_id: verifyResponse.data.CharacterID,
        character_name: verifyResponse.data.CharacterName,
        expires_on: verifyResponse.data.ExpiresOn,
        scopes: verifyResponse.data.Scopes,
        token_type: verifyResponse.data.TokenType,
        character_owner_hash: verifyResponse.data.CharacterOwnerHash,
        intellectual_property: verifyResponse.data.IntellectualProperty,
      }

      // Store tokens
      tokenData.value = tokenInfo
      characterInfo.value = charInfo
      isAuthenticated.value = true

      // Store in localStorage for persistence
      localStorage.setItem('eve_token_data', JSON.stringify(tokenInfo))
      localStorage.setItem('eve_character_info', JSON.stringify(charInfo))

      // Clean up session storage
      sessionStorage.removeItem('code_verifier')
      sessionStorage.removeItem('oauth_state')

      return charInfo
    } catch (err) {
      error.value = `Authentication failed: ${err}`
      console.error('Callback error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Refresh access token
  const refreshToken = async () => {
    try {
      if (!tokenData.value?.refresh_token) {
        throw new Error('No refresh token available')
      }

      loading.value = true

      const response = await axios.post(
        `${EVE_SSO_BASE_URL}/v2/oauth/token`,
        {
          grant_type: 'refresh_token',
          refresh_token: tokenData.value.refresh_token,
          client_id: CLIENT_ID,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )

      const newTokenData = {
        ...tokenData.value,
        ...response.data,
      }

      tokenData.value = newTokenData
      localStorage.setItem('eve_token_data', JSON.stringify(newTokenData))

      return newTokenData.access_token
    } catch (err) {
      error.value = `Token refresh failed: ${err}`
      console.error('Token refresh error:', err)
      logout()
      throw err
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = () => {
    tokenData.value = null
    characterInfo.value = null
    isAuthenticated.value = false
    localStorage.removeItem('eve_token_data')
    localStorage.removeItem('eve_character_info')
    sessionStorage.removeItem('code_verifier')
    sessionStorage.removeItem('oauth_state')
  }

  // Initialize from localStorage
  const initialize = () => {
    try {
      const savedTokenData = localStorage.getItem('eve_token_data')
      const savedCharInfo = localStorage.getItem('eve_character_info')

      if (savedTokenData && savedCharInfo) {
        const parsedTokenData = JSON.parse(savedTokenData)
        const parsedCharInfo = JSON.parse(savedCharInfo)

        // Check if token is expired (with 5-minute buffer)
        const expiresAt = new Date(parsedCharInfo.expires_on).getTime()
        const now = Date.now()
        const buffer = 5 * 60 * 1000 // 5 minutes

        if (expiresAt > now + buffer) {
          tokenData.value = parsedTokenData
          characterInfo.value = parsedCharInfo
          isAuthenticated.value = true
        } else {
          // Try to refresh token
          refreshToken().catch(() => {
            logout()
          })
        }
      }
    } catch (err) {
      console.error('Initialization error:', err)
      logout()
    }
  }

  // Get authenticated HTTP client
  const getAuthenticatedAxios = () => {
    const instance = axios.create()

    instance.interceptors.request.use(async (config) => {
      if (tokenData.value?.access_token) {
        // Check if token needs refresh
        if (characterInfo.value) {
          const expiresAt = new Date(characterInfo.value.expires_on).getTime()
          const now = Date.now()
          const buffer = 5 * 60 * 1000 // 5 minutes

          if (expiresAt <= now + buffer) {
            await refreshToken()
          }
        }

        config.headers.Authorization = `Bearer ${tokenData.value.access_token}`
      }
      return config
    })

    return instance
  }

  // Computed properties
  const accessToken = computed(() => tokenData.value?.access_token)
  const characterId = computed(() => characterInfo.value?.character_id)
  const characterName = computed(() => characterInfo.value?.character_name)

  return {
    // State
    isAuthenticated,
    loading,
    error,
    tokenData,
    characterInfo,

    // Computed
    accessToken,
    characterId,
    characterName,

    // Methods
    login,
    logout,
    handleCallback,
    refreshToken,
    initialize,
    getAuthenticatedAxios,

    // Constants
    CLIENT_ID,
    REDIRECT_URI,
    SCOPES,
  }
}
