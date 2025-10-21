import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue')
  },
  {
    path: '/plan',
    name: 'Plan',
    component: () => import('../pages/Plan.vue')
  },
  {
    path: '/inside',
    name: 'Inside',
    component: () => import('../pages/Inside.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
