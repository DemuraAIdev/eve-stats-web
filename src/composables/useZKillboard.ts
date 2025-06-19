import axios from 'axios'
import { ref } from 'vue'

const ZKILLBOARD_BASE_URL = 'https://zkillboard.com/api'

export interface Killmail {
  killmail_id: number
  killmail_time: string
  victim: {
    character_id?: number
    corporation_id: number
    alliance_id?: number
    ship_type_id: number
    damage_taken: number
  }
  attackers: Array<{
    character_id?: number
    corporation_id: number
    alliance_id?: number
    ship_type_id: number
    weapon_type_id?: number
    damage_done: number
    final_blow: boolean
  }>
  zkb: {
    locationID: number
    hash: string
    fittedValue: number
    droppedValue: number
    destroyedValue: number
    totalValue: number
    points: number
    npc: boolean
    solo: boolean
    awox: boolean
  }
}

export function useZKillboard() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const recentKills = ref<Killmail[]>([])
  const recentLosses = ref<Killmail[]>([])

  const fetchKillmails = async (
    characterId: number,
    type: 'kills' | 'losses' = 'kills',
    limit = 10,
  ) => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.get(
        `${ZKILLBOARD_BASE_URL}/${type}/characterID/${characterId}/limit/${limit}/`,
      )

      return response.data
    } catch (err) {
      error.value = `Failed to fetch ${type}: ${err}`
      console.error(`Error fetching ${type}:`, err)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchRecentKills = async (characterId: number) => {
    const kills = await fetchKillmails(characterId, 'kills', 5)
    recentKills.value = kills
  }

  const fetchRecentLosses = async (characterId: number) => {
    const losses = await fetchKillmails(characterId, 'losses', 5)
    recentLosses.value = losses
  }

  const fetchAllKillmails = async (characterId: number) => {
    await Promise.all([fetchRecentKills(characterId), fetchRecentLosses(characterId)])
  }

  const formatISK = (amount: number): string => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B ISK`
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ISK`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K ISK`
    }
    return `${amount.toFixed(0)} ISK`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
  }

  const getShipImageUrl = (shipTypeId: number): string => {
    return `https://images.evetech.net/types/${shipTypeId}/icon?size=64`
  }

  const getZKillboardUrl = (killmailId: number): string => {
    return `https://zkillboard.com/kill/${killmailId}/`
  }

  return {
    // State
    loading,
    error,
    recentKills,
    recentLosses,

    // Methods
    fetchAllKillmails,
    fetchRecentKills,
    fetchRecentLosses,
    formatISK,
    formatDate,
    getShipImageUrl,
    getZKillboardUrl,
  }
}
