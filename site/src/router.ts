import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Stream from '@/views/Stream.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/stream',
      component: Stream,
    },
  ],
})
