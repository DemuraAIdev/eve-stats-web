<template>
  <div class="min-h-screen eve-bg-darker text-white">
    <!-- Header -->
    <header class="eve-header shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <img
              v-if="characterInfo"
              :src="`https://images.evetech.net/characters/${CHARACTER_ID}/portrait?size=128`"
              :alt="characterInfo.name"
              class="w-16 h-16 rounded-full border-2 border-blue-400 eve-glow"
              @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
            />
            <div
              v-else-if="loading"
              class="w-16 h-16 rounded-full border-2 border-gray-600 bg-gray-700 animate-pulse"
            ></div>
            <div>
              <p class="text-2xl font-bold text-white" v-if="characterInfo">
                {{ characterInfo.name }}
              </p>
              <p class="text-sm eve-text-dim" v-if="CHARACTER_ID">ID: {{ CHARACTER_ID }}</p>
            </div>
          </div>
          <button
            @click="refreshAllData"
            :disabled="loading"
            class="eve-button px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Loading...' : 'Refresh Data' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Error Message -->
    <div v-if="error" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="eve-panel p-4 border-l-4 border-red-500 eve-text-danger">
        {{ error }}
      </div>
    </div>

    <!-- Character ID Setup Notice -->
    <div
      v-if="!CHARACTER_ID || CHARACTER_ID <= 0"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div class="eve-panel p-6 text-center border-l-4 border-yellow-500">
        <h2 class="text-xl font-semibold mb-2 eve-text-warning">Character ID Required</h2>
        <p class="mb-4 eve-text-dim">
          Please set the VITE_CHARACTER_ID environment variable in your .env file.
        </p>
        <p class="text-sm eve-text-dim">
          You can find your character ID from zKillboard or ESI tools.
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <main
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      v-if="CHARACTER_ID && CHARACTER_ID > 0"
    >
      <!-- Loading State -->
      <div v-if="loading && !characterInfo" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Stats Grid -->
      <div v-else class="space-y-8 eve-slide-in">
        <!-- Character Overview -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Character Info Card -->
          <div class="eve-stat-card p-6">
            <div class="flex items-start space-x-4 mb-4">
              <img
                v-if="characterInfo"
                :src="`https://images.evetech.net/characters/${CHARACTER_ID}/portrait?size=128`"
                :alt="characterInfo.name"
                class="w-16 h-16 rounded-full border-2 border-blue-400 eve-glow"
                @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
              />
              <div
                v-else-if="loading"
                class="w-16 h-16 rounded-full border-2 border-gray-600 bg-gray-700 animate-pulse"
              ></div>
              <div>
                <h3 class="text-lg font-semibold eve-text-primary">Character Info</h3>
              </div>
            </div>
            <div v-if="characterInfo" class="space-y-2">
              <p>
                <span class="eve-text-dim">Name:</span>
                <span class="ml-2 font-medium">{{ characterInfo.name }}</span>
              </p>
              <p>
                <span class="eve-text-dim">Security Status:</span>
                <span
                  class="ml-2 font-medium"
                  :class="getSecStatusColor(characterInfo.security_status)"
                >
                  {{ characterInfo.security_status?.toFixed(2) || 'Unknown' }}
                </span>
              </p>
              <p>
                <span class="eve-text-dim">Birthday:</span>
                <span class="ml-2">{{ formatDate(characterInfo.birthday) }}</span>
              </p>
              <p>
                <span class="eve-text-dim">Age:</span>
                <span class="ml-2 eve-text-accent"
                  >{{ calculateAge(characterInfo.birthday) }} days</span
                >
              </p>
            </div>
            <!-- Character Info Skeleton -->
            <div v-else-if="loading" class="space-y-3 eve-loading">
              <div class="flex items-center space-x-2">
                <div class="w-12 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div class="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div class="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div class="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-8 h-4 bg-gray-600 rounded animate-pulse"></div>
                <div class="w-12 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <!-- Corporation Card -->
          <div class="eve-stat-card p-6">
            <div class="flex items-start space-x-4 mb-4">
              <img
                v-if="characterAffiliation"
                :src="`https://images.evetech.net/corporations/${characterAffiliation.corporation_id}/logo?size=128`"
                :alt="corporationInfo?.name || 'Corporation'"
                class="w-16 h-16 rounded border-2 border-yellow-400 eve-glow"
                @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
              />
              <div
                v-else-if="loading"
                class="w-16 h-16 rounded border-2 border-gray-600 bg-gray-700 animate-pulse"
              ></div>
              <div>
                <h3 class="text-lg font-semibold eve-text-warning">Current Corporation</h3>
              </div>
            </div>
            <div v-if="corporationInfo" class="space-y-2">
              <p class="font-semibold text-white">{{ corporationInfo.name }}</p>
              <p class="eve-text-warning">[{{ corporationInfo.ticker }}]</p>
              <p class="text-sm eve-text-dim">{{ corporationInfo.member_count }} members</p>
              <p class="text-sm eve-text-dim">{{ corporationInfo.tax_rate * 100 }}% tax rate</p>
              <p v-if="corporationInfo.date_founded" class="text-sm eve-text-dim">
                Founded: {{ formatDate(corporationInfo.date_founded) }}
              </p>
            </div>
            <!-- Corporation Skeleton -->
            <div v-else-if="loading" class="space-y-3 eve-loading">
              <div class="w-32 h-5 bg-gray-700 rounded animate-pulse"></div>
              <div class="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
              <div class="w-24 h-4 bg-gray-600 rounded animate-pulse"></div>
              <div class="w-28 h-4 bg-gray-600 rounded animate-pulse"></div>
              <div class="w-36 h-4 bg-gray-600 rounded animate-pulse"></div>
              <div class="w-40 h-3 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>

          <!-- Alliance Card -->
          <div class="eve-stat-card p-6">
            <div class="flex items-start space-x-4 mb-4">
              <img
                v-if="allianceInfo && characterAffiliation?.alliance_id"
                :src="`https://images.evetech.net/alliances/${characterAffiliation.alliance_id}/logo?size=128`"
                :alt="allianceInfo.name"
                class="w-16 h-16 rounded border-2 border-purple-400 eve-glow"
                @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
              />
              <div
                class="w-16 h-16 flex items-center justify-center eve-panel rounded border-2 border-gray-600"
                v-else-if="characterAffiliation && !characterAffiliation.alliance_id"
              >
                <span class="eve-text-dim text-xs">No Alliance</span>
              </div>
              <div
                v-else-if="loading"
                class="w-16 h-16 rounded border-2 border-gray-600 bg-gray-700 animate-pulse"
              ></div>
              <div>
                <h3 class="text-lg font-semibold text-purple-400">Current Alliance</h3>
              </div>
            </div>
            <div v-if="allianceInfo" class="space-y-2">
              <p class="font-semibold text-white">{{ allianceInfo.name }}</p>
              <p class="text-purple-400">[{{ allianceInfo.ticker }}]</p>
              <p v-if="allianceInfo.date_founded" class="text-sm eve-text-dim">
                Founded: {{ formatDate(allianceInfo.date_founded) }}
              </p>
            </div>
            <div
              v-else-if="characterAffiliation && !characterAffiliation.alliance_id"
              class="text-center eve-text-dim py-4"
            >
              <p>Not in Alliance</p>
            </div>
            <!-- Alliance Skeleton -->
            <div v-else-if="loading" class="space-y-3 eve-loading">
              <div class="w-28 h-5 bg-gray-700 rounded animate-pulse"></div>
              <div class="w-16 h-4 bg-gray-600 rounded animate-pulse"></div>
              <div class="w-32 h-4 bg-gray-600 rounded animate-pulse"></div>
              <div class="w-40 h-3 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
        </section>

        <!-- Character Details -->
        <section class="eve-panel p-6">
          <h3 class="text-xl font-semibold eve-text-primary mb-6">Character Details</h3>
          <div v-if="characterInfo" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 class="font-semibold eve-text-dim mb-2">Basic Info</h4>
              <div class="space-y-1 text-sm">
                <p>
                  <span class="eve-text-dim">Character ID:</span>
                  <span class="ml-2">{{ CHARACTER_ID }}</span>
                </p>
                <p>
                  <span class="eve-text-dim">Gender:</span>
                  <span class="ml-2">{{ characterInfo.gender }}</span>
                </p>
                <p>
                  <span class="eve-text-dim">Race ID:</span>
                  <span class="ml-2">{{ characterInfo.race_id }}</span>
                </p>
                <p>
                  <span class="eve-text-dim">Bloodline ID:</span>
                  <span class="ml-2">{{ characterInfo.bloodline_id }}</span>
                </p>
              </div>
            </div>
            <div v-if="corporationInfo">
              <h4 class="font-semibold eve-text-dim mb-2">Corporation Details</h4>
              <div class="space-y-1 text-sm">
                <p>
                  <span class="eve-text-dim">Corp ID:</span>
                  <span class="ml-2">{{
                    characterAffiliation?.corporation_id || 'Loading...'
                  }}</span>
                </p>
                <p>
                  <span class="eve-text-dim">CEO:</span>
                  <button
                    v-if="ceoName && corporationInfo.ceo_id"
                    @click="fetchCharacterDetails(corporationInfo.ceo_id)"
                    class="eve-text-primary hover:eve-text-accent underline ml-2"
                    :disabled="modalLoading"
                  >
                    {{ ceoName }}
                  </button>
                  <span v-else-if="corporationInfo.ceo_id" class="text-gray-300 ml-2">
                    {{ corporationInfo.ceo_id }}
                  </span>
                  <span v-else class="eve-text-dim ml-2">Unknown</span>
                </p>
                <p v-if="corporationInfo.url" class="eve-text-dim">
                  <a
                    :href="corporationInfo.url"
                    target="_blank"
                    class="eve-text-primary hover:eve-text-accent ml-2"
                    >Website</a
                  >
                </p>
              </div>
            </div>

            <div v-if="allianceInfo">
              <h4 class="font-semibold eve-text-dim mb-2">Alliance Details</h4>
              <div class="space-y-1 text-sm">
                <p>
                  <span class="eve-text-dim">Alliance ID:</span>
                  <span class="ml-2">{{ characterAffiliation?.alliance_id || 'None' }}</span>
                </p>
                <p>
                  <span class="eve-text-dim">Creator Corp:</span>
                  <span class="ml-2">{{ allianceInfo.creator_corporation_id }}</span>
                </p>
                <p v-if="allianceInfo.executor_corporation_id">
                  <span class="eve-text-dim">Executor:</span>
                  <button
                    v-if="executorCorpName"
                    @click="fetchCorporationDetails(allianceInfo.executor_corporation_id)"
                    class="eve-text-primary hover:eve-text-accent underline ml-2"
                    :disabled="modalLoading"
                  >
                    {{ executorCorpName }}
                  </button>
                  <span v-else class="text-gray-300 ml-2">
                    {{ allianceInfo.executor_corporation_id }}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <!-- Character Details Skeleton -->
          <div v-else-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="eve-loading">
              <div class="w-20 h-5 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <div class="w-24 h-3 bg-gray-600 rounded animate-pulse"></div>
                  <div class="w-20 h-3 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-16 h-3 bg-gray-600 rounded animate-pulse"></div>
                  <div class="w-12 h-3 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-18 h-3 bg-gray-600 rounded animate-pulse"></div>
                  <div class="w-8 h-3 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-24 h-3 bg-gray-600 rounded animate-pulse"></div>
                  <div class="w-12 h-3 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div class="eve-loading">
              <div class="w-28 h-5 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <div class="w-16 h-3 bg-gray-600 rounded animate-pulse"></div>
                  <div class="w-20 h-3 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-14 h-3 bg-gray-600 rounded animate-pulse"></div>
                  <div class="w-16 h-3 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div class="w-16 h-3 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
            <div class="eve-loading">
              <div class="w-24 h-5 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <div class="w-20 h-3 bg-gray-600 rounded animate-pulse"></div>
                  <div class="w-12 h-3 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-24 h-3 bg-gray-600 rounded animate-pulse"></div>
                  <div class="w-16 h-3 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-18 h-3 bg-gray-600 rounded animate-pulse"></div>
                  <div class="w-20 h-3 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Killmails -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Recent Kills -->
          <div class="eve-panel p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold eve-text-accent">Recent Kills</h3>
              <button
                @click="refreshKills"
                :disabled="killsLoading"
                class="text-sm eve-button px-3 py-1 rounded transition-colors disabled:opacity-50"
              >
                {{ killsLoading ? 'Loading...' : 'Refresh' }}
              </button>
            </div>

            <div v-if="killsError" class="eve-text-danger text-sm mb-4">
              {{ killsError }}
            </div>

            <div v-if="recentKills.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
              <div
                v-for="kill in recentKills.slice(0, 5)"
                :key="kill.killmail_id"
                class="eve-killmail rounded p-3 hover:border-primary transition-all"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <img
                      :src="`https://images.evetech.net/types/${kill.victim.ship_type_id}/icon?size=32`"
                      :alt="'Ship'"
                      class="w-6 h-6"
                      @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                    />
                    <span class="text-sm font-medium eve-text-accent">{{
                      formatISK(kill.zkb.totalValue)
                    }}</span>
                  </div>
                  <span class="text-xs eve-text-dim">{{ formatDate(kill.killmail_time) }}</span>
                </div>
                <div class="text-xs text-gray-300">
                  <span v-if="kill.zkb.solo" class="eve-text-accent">SOLO</span>
                  <span v-if="kill.zkb.awox" class="eve-text-warning ml-2">AWOX</span>
                  <span class="ml-2">{{ kill.zkb.points }} points</span>
                </div>
                <a
                  :href="`https://zkillboard.com/kill/${kill.killmail_id}/`"
                  target="_blank"
                  class="text-xs eve-text-primary hover:eve-text-accent block mt-1"
                >
                  View on zKillboard →
                </a>
              </div>
            </div>

            <div v-else-if="!killsLoading" class="text-center eve-text-dim py-8">
              <p>No recent kills found</p>
            </div>

            <!-- Kills Skeleton -->
            <div v-else-if="killsLoading" class="space-y-3">
              <div
                v-for="i in 3"
                :key="`kill-skeleton-${i}`"
                class="eve-panel rounded p-3 animate-pulse eve-loading"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-6 h-6 bg-gray-600 rounded"></div>
                    <div class="w-16 h-4 bg-gray-600 rounded"></div>
                  </div>
                  <div class="w-20 h-3 bg-gray-600 rounded"></div>
                </div>
                <div class="flex items-center space-x-2 mb-2">
                  <div class="w-8 h-3 bg-gray-600 rounded"></div>
                  <div class="w-12 h-3 bg-gray-600 rounded"></div>
                </div>
                <div class="w-32 h-3 bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>

          <!-- Recent Losses -->
          <div class="eve-panel p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold eve-text-danger">Recent Losses</h3>
              <button
                @click="refreshLosses"
                :disabled="killsLoading"
                class="text-sm eve-button px-3 py-1 rounded transition-colors disabled:opacity-50"
              >
                {{ killsLoading ? 'Loading...' : 'Refresh' }}
              </button>
            </div>

            <div v-if="killsError" class="eve-text-danger text-sm mb-4">
              {{ killsError }}
            </div>

            <div v-if="recentLosses.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
              <div
                v-for="loss in recentLosses.slice(0, 5)"
                :key="loss.killmail_id"
                class="eve-killmail rounded p-3 hover:border-primary transition-all"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <img
                      :src="`https://images.evetech.net/types/${loss.victim.ship_type_id}/icon?size=32`"
                      :alt="'Ship'"
                      class="w-6 h-6"
                      @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                    />
                    <span class="text-sm font-medium eve-text-danger">{{
                      formatISK(loss.zkb.totalValue)
                    }}</span>
                  </div>
                  <span class="text-xs eve-text-dim">{{ formatDate(loss.killmail_time) }}</span>
                </div>
                <div class="text-xs text-gray-300">
                  <span>{{ loss.attackers.length }} attackers</span>
                  <span class="ml-2">{{ loss.zkb.points }} points</span>
                </div>
                <a
                  :href="`https://zkillboard.com/kill/${loss.killmail_id}/`"
                  target="_blank"
                  class="text-xs eve-text-primary hover:eve-text-accent block mt-1"
                >
                  View on zKillboard →
                </a>
              </div>
            </div>

            <div v-else-if="!killsLoading" class="text-center eve-text-dim py-8">
              <p>No recent losses found</p>
            </div>

            <!-- Losses Skeleton -->
            <div v-else-if="killsLoading" class="space-y-3">
              <div
                v-for="i in 3"
                :key="`loss-skeleton-${i}`"
                class="eve-panel rounded p-3 animate-pulse eve-loading"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-6 h-6 bg-gray-600 rounded"></div>
                    <div class="w-16 h-4 bg-gray-600 rounded"></div>
                  </div>
                  <div class="w-20 h-3 bg-gray-600 rounded"></div>
                </div>
                <div class="flex items-center space-x-2 mb-2">
                  <div class="w-20 h-3 bg-gray-600 rounded"></div>
                  <div class="w-12 h-3 bg-gray-600 rounded"></div>
                </div>
                <div class="w-32 h-3 bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Character Details Modal -->
    <div
      v-if="showCharacterModal"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      @click="showCharacterModal = false"
    >
      <div
        class="eve-panel p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto border-2 border-blue-500 eve-glow"
        @click.stop
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold eve-text-primary">Character Details</h3>
          <button
            @click="showCharacterModal = false"
            class="eve-text-dim hover:text-white text-xl transition-colors"
          >
            ×
          </button>
        </div>

        <div v-if="modalCharacterInfo" class="space-y-4">
          <div class="flex items-start space-x-4">
            <img
              :src="`https://images.evetech.net/characters/${modalCharacterInfo.character_id}/portrait?size=128`"
              :alt="modalCharacterInfo.name"
              class="w-20 h-20 rounded-full border-2 border-blue-400 eve-glow"
              @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
            />
            <div>
              <h4 class="text-lg font-semibold text-white">{{ modalCharacterInfo.name }}</h4>
              <p class="eve-text-dim">ID: {{ modalCharacterInfo.character_id }}</p>
              <p class="eve-text-dim">
                Security Status: {{ modalCharacterInfo.security_status?.toFixed(2) || 'Unknown' }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 class="font-semibold eve-text-dim mb-2">Basic Information</h5>
              <div class="space-y-1 text-sm">
                <p>
                  <span class="eve-text-dim">Gender:</span>
                  <span class="ml-2">{{ modalCharacterInfo.gender }}</span>
                </p>
                <p>
                  <span class="eve-text-dim">Race ID:</span>
                  <span class="ml-2">{{ modalCharacterInfo.race_id }}</span>
                </p>
                <p>
                  <span class="eve-text-dim">Bloodline ID:</span>
                  <span class="ml-2">{{ modalCharacterInfo.bloodline_id }}</span>
                </p>
                <p>
                  <span class="eve-text-dim">Birthday:</span>
                  <span class="ml-2">{{ formatDate(modalCharacterInfo.birthday) }}</span>
                </p>
                <p>
                  <span class="eve-text-dim">Age:</span>
                  <span class="ml-2 eve-text-accent"
                    >{{ calculateAge(modalCharacterInfo.birthday) }} days</span
                  >
                </p>
              </div>
            </div>

            <div v-if="modalCharacterInfo.corporation">
              <h5 class="font-semibold eve-text-dim mb-2">Corporation</h5>
              <div class="space-y-1 text-sm">
                <p class="font-medium">{{ modalCharacterInfo.corporation.name }}</p>
                <p class="eve-text-warning">[{{ modalCharacterInfo.corporation.ticker }}]</p>
                <p>
                  <span class="eve-text-dim">Members:</span>
                  <span class="ml-2">{{ modalCharacterInfo.corporation.member_count }}</span>
                </p>
                <p>
                  <span class="eve-text-dim">Tax Rate:</span>
                  <span class="ml-2">{{ modalCharacterInfo.corporation.tax_rate * 100 }}%</span>
                </p>
                <p v-if="modalCharacterInfo.corporation.date_founded">
                  <span class="eve-text-dim">Founded:</span>
                  <span class="ml-2">{{
                    formatDate(modalCharacterInfo.corporation.date_founded)
                  }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="modalLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>

    <!-- Corporation Details Modal -->
    <div
      v-if="showCorporationModal"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      @click="showCorporationModal = false"
    >
      <div
        class="eve-panel p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto border-2 border-yellow-500 eve-glow"
        @click.stop
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold eve-text-warning">Corporation Details</h3>
          <button
            @click="showCorporationModal = false"
            class="eve-text-dim hover:text-white text-xl transition-colors"
          >
            ×
          </button>
        </div>

        <div v-if="modalCorporationInfo" class="space-y-4">
          <div class="flex items-start space-x-4">
            <img
              :src="`https://images.evetech.net/corporations/${modalCorporationInfo.corporation_id}/logo?size=128`"
              :alt="modalCorporationInfo.name"
              class="w-20 h-20 rounded border-2 border-yellow-400 eve-glow"
              @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
            />
            <div>
              <h4 class="text-lg font-semibold text-white">{{ modalCorporationInfo.name }}</h4>
              <p class="eve-text-warning">[{{ modalCorporationInfo.ticker }}]</p>
              <p class="eve-text-dim">ID: {{ modalCorporationInfo.corporation_id }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 class="font-semibold eve-text-dim mb-2">Basic Information</h5>
              <div class="space-y-1 text-sm">
                <p>
                  <span class="eve-text-dim">Members:</span>
                  <span class="ml-2">{{ modalCorporationInfo.member_count }}</span>
                </p>
                <p>
                  <span class="eve-text-dim">Tax Rate:</span>
                  <span class="ml-2">{{ modalCorporationInfo.tax_rate * 100 }}%</span>
                </p>
                <p v-if="modalCorporationInfo.date_founded">
                  <span class="eve-text-dim">Founded:</span>
                  <span class="ml-2">{{ formatDate(modalCorporationInfo.date_founded) }}</span>
                </p>
                <p v-if="modalCorporationInfo.shares">
                  <span class="eve-text-dim">Shares:</span>
                  <span class="ml-2">{{ modalCorporationInfo.shares.toLocaleString() }}</span>
                </p>
                <p v-if="modalCorporationInfo.url">
                  <span class="eve-text-dim">Website:</span>
                  <a
                    :href="modalCorporationInfo.url"
                    target="_blank"
                    class="eve-text-primary hover:eve-text-accent ml-1"
                  >
                    {{ modalCorporationInfo.url }}
                  </a>
                </p>
              </div>
            </div>

            <div v-if="modalCorporationInfo.ceo">
              <h5 class="font-semibold eve-text-dim mb-2">CEO</h5>
              <div class="flex items-center space-x-3 mb-2">
                <img
                  :src="`https://images.evetech.net/characters/${modalCorporationInfo.ceo_id}/portrait?size=64`"
                  :alt="modalCorporationInfo.ceo.name"
                  class="w-12 h-12 rounded-full border border-blue-400"
                  @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                />
                <div>
                  <p class="font-medium">{{ modalCorporationInfo.ceo.name }}</p>
                  <p class="eve-text-dim text-sm">ID: {{ modalCorporationInfo.ceo_id }}</p>
                </div>
              </div>
              <div class="space-y-1 text-sm">
                <p>
                  <span class="eve-text-dim">Security Status:</span>
                  <span class="ml-2">{{
                    modalCorporationInfo.ceo.security_status?.toFixed(2) || 'Unknown'
                  }}</span>
                </p>
                <p>
                  <span class="eve-text-dim">Birthday:</span>
                  <span class="ml-2">{{ formatDate(modalCorporationInfo.ceo.birthday) }}</span>
                </p>
              </div>
            </div>
          </div>

          <div v-if="modalCorporationInfo.description" class="mt-4">
            <h5 class="font-semibold eve-text-dim mb-2">Description</h5>
            <p class="text-sm text-gray-300 leading-relaxed">
              {{ modalCorporationInfo.description }}
            </p>
          </div>
        </div>

        <div v-else-if="modalLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useEsiApi } from '../composables/useEsiApiPublic'
import { useZKillboard } from '../composables/useZKillboard'
import axios from 'axios'

const {
  loading,
  error,
  characterInfo,
  characterAffiliation,
  corporationInfo,
  allianceInfo,
  fetchAllData,
  CHARACTER_ID,
} = useEsiApi()

const {
  loading: killsLoading,
  error: killsError,
  recentKills,
  recentLosses,
  fetchRecentKills,
  fetchRecentLosses,
} = useZKillboard()

// Modal state
const showCharacterModal = ref(false)
const showCorporationModal = ref(false)

interface CharacterModalInfo {
  character_id: number
  name: string
  security_status?: number
  gender: string
  race_id: number
  bloodline_id: number
  birthday: string
  corporation?: {
    name: string
    ticker: string
    member_count: number
    tax_rate: number
    date_founded?: string
  }
}

interface CorporationModalInfo {
  corporation_id: number
  name: string
  ticker: string
  member_count: number
  tax_rate: number
  date_founded?: string
  shares?: number
  url?: string
  description?: string
  ceo_id: number
  ceo?: {
    name: string
    security_status?: number
    birthday: string
  }
}

const modalCharacterInfo = ref<CharacterModalInfo | null>(null)
const modalCorporationInfo = ref<CorporationModalInfo | null>(null)
const modalLoading = ref(false)

// CEO and Executor names
const ceoName = ref<string>('')
const executorCorpName = ref<string>('')

const ESI_BASE_URL = 'https://esi.evetech.net/latest'

// Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString()
}

const calculateAge = (birthday: string): number => {
  const birthDate = new Date(birthday)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - birthDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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

// Fetch CEO name
const fetchCeoName = async (ceoId: number) => {
  try {
    const response = await axios.get(`${ESI_BASE_URL}/characters/${ceoId}/`)
    ceoName.value = response.data.name
  } catch (err) {
    console.error('Error fetching CEO name:', err)
    ceoName.value = `CEO ID: ${ceoId}`
  }
}

// Fetch executor corporation name
const fetchExecutorCorpName = async (corpId: number) => {
  try {
    const response = await axios.get(`${ESI_BASE_URL}/corporations/${corpId}/`)
    executorCorpName.value = response.data.name
  } catch (err) {
    console.error('Error fetching executor corp name:', err)
    executorCorpName.value = `Corp ID: ${corpId}`
  }
}

// Fetch detailed character info for modal
const fetchCharacterDetails = async (characterId: number) => {
  modalLoading.value = true
  try {
    const [charResponse, portraitResponse] = await Promise.all([
      axios.get(`${ESI_BASE_URL}/characters/${characterId}/`),
      axios.get(`${ESI_BASE_URL}/characters/${characterId}/portrait/`),
    ])

    // Get corporation info
    let corpInfo = null
    if (charResponse.data.corporation_id) {
      try {
        const corpResponse = await axios.get(
          `${ESI_BASE_URL}/corporations/${charResponse.data.corporation_id}/`,
        )
        corpInfo = corpResponse.data
      } catch (err) {
        console.error('Error fetching character corporation:', err)
      }
    }

    modalCharacterInfo.value = {
      ...charResponse.data,
      portrait: portraitResponse.data,
      corporation: corpInfo,
    }
    showCharacterModal.value = true
  } catch (err) {
    console.error('Error fetching character details:', err)
  } finally {
    modalLoading.value = false
  }
}

// Fetch detailed corporation info for modal
const fetchCorporationDetails = async (corporationId: number) => {
  modalLoading.value = true
  try {
    const corpResponse = await axios.get(`${ESI_BASE_URL}/corporations/${corporationId}/`)

    // Get CEO info
    let ceoInfo = null
    if (corpResponse.data.ceo_id) {
      try {
        const ceoResponse = await axios.get(
          `${ESI_BASE_URL}/characters/${corpResponse.data.ceo_id}/`,
        )
        ceoInfo = ceoResponse.data
      } catch (err) {
        console.error('Error fetching CEO details:', err)
      }
    }

    modalCorporationInfo.value = {
      ...corpResponse.data,
      ceo: ceoInfo,
    }
    showCorporationModal.value = true
  } catch (err) {
    console.error('Error fetching corporation details:', err)
  } finally {
    modalLoading.value = false
  }
}

const refreshAllData = async () => {
  await fetchAllData()

  // Fetch CEO name if corporation info is available
  if (corporationInfo.value?.ceo_id) {
    await fetchCeoName(corporationInfo.value.ceo_id)
  }

  // Fetch executor corp name if alliance info is available
  if (allianceInfo.value?.executor_corporation_id) {
    await fetchExecutorCorpName(allianceInfo.value.executor_corporation_id)
  }
}

const refreshKills = async () => {
  if (CHARACTER_ID) {
    await fetchRecentKills(CHARACTER_ID)
  }
}

const refreshLosses = async () => {
  if (CHARACTER_ID) {
    await fetchRecentLosses(CHARACTER_ID)
  }
}

// Security status color helper
const getSecStatusColor = (secStatus: number | undefined): string => {
  if (!secStatus) return 'eve-text-dim'

  if (secStatus >= 5.0) return 'eve-text-accent' // High security - green
  if (secStatus >= 0.0) return 'eve-text-primary' // Positive - blue
  if (secStatus >= -2.0) return 'eve-text-warning' // Low negative - yellow
  if (secStatus >= -5.0) return 'eve-text-secondary' // Medium negative - orange
  return 'eve-text-danger' // Very negative - red
}

// Initialize data on mount
onMounted(async () => {
  await refreshAllData()
  if (CHARACTER_ID) {
    await Promise.all([fetchRecentKills(CHARACTER_ID), fetchRecentLosses(CHARACTER_ID)])
  }
})
</script>
