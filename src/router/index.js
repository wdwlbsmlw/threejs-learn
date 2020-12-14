import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/ship',
        name: 'ship',
        component: () => import('../views/ship/')
    },
    {
        path: '/wp',
        name: 'wp',
        component: () => import('../views/wp/')
    },
    {
        path: '/test',
        name: 'test',
        component: () => import('../views/test/')
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
