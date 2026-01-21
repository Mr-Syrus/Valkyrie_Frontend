import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import PopApTrivogaAi from '@/components/pop_ap_trivoga_ai.vue'
import PopApTrivogaAi2 from '@/components/pop_ap_trivoga_ai_2.vue'
import PopApTrivoga from '@/components/pop_ap_trivoga.vue'
import Navbar from '@/components/Navbar.vue'

const routes = [
    { path: '/login', name: 'login', component: Login },
    { path: '/pop_ap_trivoga_ai', name: 'pop_ap_trivoga_ai', component: PopApTrivogaAi },
    { path: '/pop_ap_trivoga_ai_2', name: 'pop_ap_trivoga_ai_2', component: PopApTrivogaAi2 },
    { path: '/pop_ap_trivoga', name: 'pop_ap_trivoga', component: PopApTrivoga },
    { path: '/navbar', name: 'Navbar', component: Navbar },
]

export default createRouter({
    history: createWebHistory(),
    routes
})
