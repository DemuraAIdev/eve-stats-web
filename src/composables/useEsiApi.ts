import axios from 'axios'
import { ref, computed } from 'vue'

const ESI_BASE_URL = 'https://esi.evetech.net/latest'

// Get character ID from environment variable
const CHARACTER_ID = parseInt(import.meta.env.VITE_CHARACTER_ID) || 0

export interface CharacterInfo {
  character_id: number
  name: string
  description?: string
  corporation_id: number
  alliance_id?: number
  birthday: string
  gender: string
  race_id: number
  bloodline_id: number
  ancestry_id?: number
  security_status?: number
  faction_id?: number
  title?: string
}

export interface CharacterSkills {
  skills: Array<{
    skill_id: number
    skillpoints_in_skill: number
    trained_skill_level: number
    active_skill_level: number
  }>
  total_sp: number
  unallocated_sp?: number
}

export interface CharacterAttributes {
  accrued_remap_cooldown_date?: string
  bonus_remaps?: number
  charisma: number
  intelligence: number
  last_remap_date?: string
  memory: number
  perception: number
  willpower: number
}

export interface WalletInfo {
  balance: number
}

export interface CorporationInfo {
  alliance_id?: number
  ceo_id: number
  creator_id: number
  date_founded?: string
  description?: string
  faction_id?: number
  home_station_id?: number
  member_count: number
  name: string
  shares?: number
  tax_rate: number
  ticker: string
  url?: string
  war_eligible?: boolean
}

export function useEsiApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const characterInfo = ref<CharacterInfo | null>(null)
  const characterSkills = ref<CharacterSkills | null>(null)
  const characterAttributes = ref<CharacterAttributes | null>(null)
  const walletBalance = ref<WalletInfo | null>(null)
  const corporationInfo = ref<CorporationInfo | null>(null)

  const totalSkillPoints = computed(() => {
    return characterSkills.value?.total_sp || 0
  })

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  const formatISK = (amount: number): string => {
    if (amount >= 1000000000000) {
      return `${(amount / 1000000000000).toFixed(2)}T ISK`
    } else if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(2)}B ISK`
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M ISK`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)}K ISK`
    }
    return `${amount.toFixed(2)} ISK`
  }

  const fetchCharacterInfo = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.get(`${ESI_BASE_URL}/characters/${CHARACTER_ID}/`)
      characterInfo.value = response.data
    } catch (err) {
      error.value = `Failed to fetch character info: ${err}`
      console.error('Error fetching character info:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCharacterSkills = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.get(`${ESI_BASE_URL}/characters/${CHARACTER_ID}/skills/`)
      characterSkills.value = response.data
    } catch (err) {
      if ((err as { response?: { status?: number } })?.response?.status === 401) {
        console.warn('Skills data requires authentication - character skills set to private')
        characterSkills.value = { skills: [], total_sp: 0 }
      } else {
        error.value = `Failed to fetch character skills: ${err}`
        console.error('Error fetching character skills:', err)
      }
    } finally {
      loading.value = false
    }
  }

  const fetchCharacterAttributes = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.get(`${ESI_BASE_URL}/characters/${CHARACTER_ID}/attributes/`)
      characterAttributes.value = response.data
    } catch (err) {
      if ((err as { response?: { status?: number } })?.response?.status === 401) {
        console.warn(
          'Attributes data requires authentication - character attributes set to private',
        )
        characterAttributes.value = {
          charisma: 0,
          intelligence: 0,
          memory: 0,
          perception: 0,
          willpower: 0,
        }
      } else {
        error.value = `Failed to fetch character attributes: ${err}`
        console.error('Error fetching character attributes:', err)
      }
    } finally {
      loading.value = false
    }
  }

  const fetchWalletBalance = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.get(`${ESI_BASE_URL}/characters/${CHARACTER_ID}/wallet/`)
      walletBalance.value = { balance: response.data }
    } catch (err) {
      if ((err as { response?: { status?: number } })?.response?.status === 401) {
        console.warn('Wallet data requires authentication - character wallet set to private')
        walletBalance.value = { balance: 0 }
      } else {
        error.value = `Failed to fetch wallet balance: ${err}`
        console.error('Error fetching wallet balance:', err)
      }
    } finally {
      loading.value = false
    }
  }

  const fetchCorporationInfo = async () => {
    try {
      console.log('Fetching corporation info for character:', CHARACTER_ID)
      if (!characterInfo.value?.corporation_id) return

      loading.value = true
      error.value = null

      const response = await axios.get(
        `${ESI_BASE_URL}/corporations/${characterInfo.value.corporation_id}/`,
      )
      corporationInfo.value = response.data
    } catch (err) {
      error.value = `Failed to fetch corporation info: ${err}`
      console.error('Error fetching corporation info:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchAllData = async () => {
    if (!CHARACTER_ID || CHARACTER_ID <= 0) {
      error.value = 'Character ID not configured in environment variables'
      return
    }

    await fetchCharacterInfo()
    await fetchCharacterSkills()
    await fetchCharacterAttributes()
    await fetchWalletBalance()
    await fetchCorporationInfo()
  }

  return {
    // State
    loading,
    error,
    characterInfo,
    characterSkills,
    characterAttributes,
    walletBalance,
    corporationInfo,

    // Computed
    totalSkillPoints,

    // Methods
    fetchCharacterInfo,
    fetchCharacterSkills,
    fetchCharacterAttributes,
    fetchWalletBalance,
    fetchCorporationInfo,
    fetchAllData,
    formatNumber,
    formatISK,

    // Constants
    CHARACTER_ID,
  }
}
