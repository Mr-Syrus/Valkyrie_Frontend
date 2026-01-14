import { createRouter, createWebHistory } from 'vue-router'
import login from '@/views/login.vue'
import pop_ap_trivoga from '@/components/pop_ap_trivoga.vue'

const routes = [
    { path: '/login', name: 'login', component: login },
    { path: '/pop_ap_trivoga', name: 'pop_ap_trivoga', component: pop_ap_trivoga },
]

export default createRouter({
    history: createWebHistory(),
    routes
})
