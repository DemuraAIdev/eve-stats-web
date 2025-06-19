import axios from 'axios'
import { ref } from 'vue'

const ESI_BASE_URL = 'https://esi.evetech.net/latest'

// Get character ID from environment variable
const CHARACTER_ID = parseInt(import.meta.env.VITE_CHARACTER_ID) || 0

export interface CharacterInfo {
  name: string
  corporation_id: number
  birthday: string
  gender: string
  race_id: number
  bloodline_id: number
  security_status?: number
}

export interface CharacterAffiliation {
  alliance_id?: number
  character_id: number
  corporation_id: number
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

export interface AllianceInfo {
  alliance_id: number
  name: string
  ticker: string
  creator_corporation_id: number
  creator_id: number
  date_founded: string
  executor_corporation_id?: number
  faction_id?: number
}

export function useEsiApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const characterInfo = ref<CharacterInfo | null>(null)
  const characterAffiliation = ref<CharacterAffiliation | null>(null)
  const corporationInfo = ref<CorporationInfo | null>(null)
  const allianceInfo = ref<AllianceInfo | null>(null)

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  const fetchCharacterInfo = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.get(`${ESI_BASE_URL}/characters/${CHARACTER_ID}/`)
      characterInfo.value = response.data
      console.log('Character info loaded:', characterInfo.value)
    } catch (err) {
      error.value = `Failed to fetch character info: ${err}`
      console.error('Error fetching character info:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCharacterAffiliation = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.post(
        `${ESI_BASE_URL}/characters/affiliation/?datasource=tranquility`,
        [CHARACTER_ID],
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.data && response.data.length > 0) {
        characterAffiliation.value = response.data[0]
        console.log('Character affiliation loaded:', characterAffiliation.value)
      }
    } catch (err) {
      error.value = `Failed to fetch character affiliation: ${err}`
      console.error('Error fetching character affiliation:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCorporationInfo = async () => {
    try {
      if (!characterAffiliation.value?.corporation_id) return

      loading.value = true
      error.value = null

      const response = await axios.get(
        `${ESI_BASE_URL}/corporations/${characterAffiliation.value.corporation_id}/`,
      )
      corporationInfo.value = response.data
      console.log('Corporation info loaded:', corporationInfo.value)
    } catch (err) {
      error.value = `Failed to fetch corporation info: ${err}`
      console.error('Error fetching corporation info:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchAllianceInfo = async () => {
    try {
      if (!characterAffiliation.value?.alliance_id) {
        allianceInfo.value = null
        return
      }

      loading.value = true
      error.value = null

      const response = await axios.get(
        `${ESI_BASE_URL}/alliances/${characterAffiliation.value.alliance_id}/`,
      )
      allianceInfo.value = response.data
      console.log('Alliance info loaded:', allianceInfo.value)
    } catch (err) {
      error.value = `Failed to fetch alliance info: ${err}`
      console.error('Error fetching alliance info:', err)
      allianceInfo.value = null
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
    await fetchCharacterAffiliation()
    await fetchCorporationInfo()
    await fetchAllianceInfo()
  }

  return {
    // State
    loading,
    error,
    characterInfo,
    characterAffiliation,
    corporationInfo,
    allianceInfo,

    // Methods
    fetchCharacterInfo,
    fetchCharacterAffiliation,
    fetchCorporationInfo,
    fetchAllianceInfo,
    fetchAllData,
    formatNumber,

    // Constants
    CHARACTER_ID,
  }
}
