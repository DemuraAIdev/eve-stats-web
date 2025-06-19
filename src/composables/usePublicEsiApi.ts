import axios from 'axios'
import { ref } from 'vue'

const ESI_BASE_URL = 'https://esi.evetech.net/latest'

export interface SkillType {
  type_id: number
  name: string
  description: string
  group_id: number
  published: boolean
  attributes?: {
    primary_attribute?: number
    secondary_attribute?: number
    skill_time_constant?: number
  }
}

export interface TypeInfo {
  type_id: number
  name: string
  description: string
  group_id: number
  published: boolean
}

export interface GroupInfo {
  group_id: number
  name: string
  category_id: number
  published: boolean
}

export function usePublicEsiApi() {
  const skillsCache = ref<Map<number, SkillType>>(new Map())
  const typesCache = ref<Map<number, TypeInfo>>(new Map())
  const groupsCache = ref<Map<number, GroupInfo>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSkillInfo = async (skillId: number): Promise<SkillType | null> => {
    if (skillsCache.value.has(skillId)) {
      return skillsCache.value.get(skillId)!
    }

    try {
      loading.value = true
      const response = await axios.get(`${ESI_BASE_URL}/universe/types/${skillId}/`)
      const skillInfo: SkillType = response.data
      skillsCache.value.set(skillId, skillInfo)
      return skillInfo
    } catch (err) {
      console.error(`Error fetching skill info for ${skillId}:`, err)
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchTypeInfo = async (typeId: number): Promise<TypeInfo | null> => {
    if (typesCache.value.has(typeId)) {
      return typesCache.value.get(typeId)!
    }

    try {
      loading.value = true
      const response = await axios.get(`${ESI_BASE_URL}/universe/types/${typeId}/`)
      const typeInfo: TypeInfo = response.data
      typesCache.value.set(typeId, typeInfo)
      return typeInfo
    } catch (err) {
      console.error(`Error fetching type info for ${typeId}:`, err)
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchGroupInfo = async (groupId: number): Promise<GroupInfo | null> => {
    if (groupsCache.value.has(groupId)) {
      return groupsCache.value.get(groupId)!
    }

    try {
      loading.value = true
      const response = await axios.get(`${ESI_BASE_URL}/universe/groups/${groupId}/`)
      const groupInfo: GroupInfo = response.data
      groupsCache.value.set(groupId, groupInfo)
      return groupInfo
    } catch (err) {
      console.error(`Error fetching group info for ${groupId}:`, err)
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchMultipleSkillInfo = async (skillIds: number[]): Promise<Map<number, SkillType>> => {
    const results = new Map<number, SkillType>()

    // Filter out already cached skills
    const uncachedSkillIds = skillIds.filter((id) => !skillsCache.value.has(id))

    // Get cached skills
    skillIds.forEach((id) => {
      if (skillsCache.value.has(id)) {
        results.set(id, skillsCache.value.get(id)!)
      }
    })

    if (uncachedSkillIds.length === 0) {
      return results
    }

    try {
      loading.value = true

      // Fetch uncached skills in batches to avoid overwhelming the API
      const batchSize = 10
      for (let i = 0; i < uncachedSkillIds.length; i += batchSize) {
        const batch = uncachedSkillIds.slice(i, i + batchSize)
        const promises = batch.map(async (skillId) => {
          try {
            const response = await axios.get(`${ESI_BASE_URL}/universe/types/${skillId}/`)
            const skillInfo: SkillType = response.data
            skillsCache.value.set(skillId, skillInfo)
            results.set(skillId, skillInfo)
          } catch (err) {
            console.error(`Error fetching skill ${skillId}:`, err)
          }
        })

        await Promise.all(promises)

        // Small delay between batches to be respectful to the API
        if (i + batchSize < uncachedSkillIds.length) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }
    } catch (err) {
      error.value = `Failed to fetch multiple skills: ${err}`
      console.error('Error fetching multiple skills:', err)
    } finally {
      loading.value = false
    }

    return results
  }

  const getSkillName = (skillId: number): string => {
    const skill = skillsCache.value.get(skillId)
    return skill?.name || `Skill ${skillId}`
  }

  const clearCache = () => {
    skillsCache.value.clear()
    typesCache.value.clear()
    groupsCache.value.clear()
  }

  return {
    // State
    loading,
    error,
    skillsCache,
    typesCache,
    groupsCache,

    // Methods
    fetchSkillInfo,
    fetchTypeInfo,
    fetchGroupInfo,
    fetchMultipleSkillInfo,
    getSkillName,
    clearCache,
  }
}
