import { createRouter, createWebHistory } from 'vue-router'
import IndexView from '../views/IndexView.vue'
import ApplicationView from '../views/ApplicationView.vue'
import OnboardingView from '../views/OnboardingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: IndexView
    },
    {
      path: '/application',
      name: 'application',
      component: ApplicationView
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: OnboardingView
    },
    {
      path: '/dev',
      name: 'dev',
      component: () => import('../views/DevPage.vue')
    }
  ]
})

export default router
