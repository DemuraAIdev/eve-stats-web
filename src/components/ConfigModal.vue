<template>
  <div class="fixed top-4 right-4 z-50">
    <button
      @click="showConfig = !showConfig"
      class="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg shadow-lg transition-colors"
      title="Configuration"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        ></path>
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        ></path>
      </svg>
    </button>

    <!-- Configuration Modal -->
    <div
      v-if="showConfig"
      class="absolute top-12 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 w-80"
    >
      <h3 class="text-lg font-semibold text-white mb-4">Configuration</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2"> Character ID </label>
          <input
            v-model="tempCharacterId"
            type="number"
            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your character ID"
          />
          <p class="text-xs text-gray-400 mt-1">Find your character ID from ESI or EVE tools</p>
        </div>

        <div class="bg-gray-700 rounded p-3">
          <h4 class="text-sm font-semibold text-gray-300 mb-2">How to find your Character ID:</h4>
          <ol class="text-xs text-gray-400 space-y-1">
            <li>
              1. Go to
              <a
                href="https://zkillboard.com"
                target="_blank"
                class="text-blue-400 hover:text-blue-300"
                >zkillboard.com</a
              >
            </li>
            <li>2. Search for your character name</li>
            <li>3. The URL will show your character ID</li>
            <li>4. Or use ESI: /characters/?names=YourName</li>
          </ol>
        </div>

        <div class="flex space-x-3">
          <button
            @click="saveConfiguration"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
          >
            Save
          </button>
          <button
            @click="showConfig = false"
            class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{
  'character-id-changed': [characterId: number]
}>()

const showConfig = ref(false)
const tempCharacterId = ref<number>(0)

const saveConfiguration = () => {
  if (tempCharacterId.value && tempCharacterId.value > 0) {
    localStorage.setItem('eve-character-id', tempCharacterId.value.toString())
    emit('character-id-changed', tempCharacterId.value)
    showConfig.value = false
  }
}

onMounted(() => {
  const savedId = localStorage.getItem('eve-character-id')
  if (savedId) {
    tempCharacterId.value = parseInt(savedId)
  }
})
</script>
