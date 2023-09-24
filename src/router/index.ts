import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      meta: {
        title: 'Home'
      },
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/about',
      name: 'about',
      meta: {
        title: 'About'
      },
      component: () => import('@/views/AboutView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: { name: 'home' }
    }
  ]
})

const DEFAULT_TITLE = import.meta.env.VITE_APP_TITLE

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${DEFAULT_TITLE}: ${to.meta.title}` : DEFAULT_TITLE
  next()
})

export default router
