import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
    {
        path: '/',
        component: () => import('../views/Dashboard/Dashboard.vue'),
        name: 'Dashboard'
    },
    {
        path: '/projectManagement',
        component: () => import('../views/projectManagement/projectManagement.vue'),
        name: 'projectManagement'
    },
    {
        path: '/projectDetail/:id',
        component: () => import('../views/projectDetail/projectDetail.vue'),
        name: 'projectDetail',
        prop: true
    }
]

export const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })