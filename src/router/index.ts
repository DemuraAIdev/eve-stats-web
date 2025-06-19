import { createRouter, createWebHistory } from 'vue-router'
import StatsView from '../views/StatsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'stats',
      component: StatsView,
    },
  ],
})

export default router
