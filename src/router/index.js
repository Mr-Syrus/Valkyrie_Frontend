import { createRouter, createWebHistory } from 'vue-router'
import login from '@/views/login.vue'
import PopApTrivogaAi from '@/components/pop_ap_trivoga_ai.vue'
import PopApTrivogaAi2 from '@/components/pop_ap_trivoga_ai_2.vue'
import PopApTrivoga from '@/components/pop_ap_trivoga.vue'

const routes = [
    { path: '/login', name: 'login', component: login },
    { path: '/pop_ap_trivoga_ai', name: 'pop_ap_trivoga_ai', component: PopApTrivogaAi },
    { path: '/pop_ap_trivoga_ai_2', name: 'pop_ap_trivoga_ai_2', component: PopApTrivogaAi2 },
    { path: '/pop_ap_trivoga', name: 'pop_ap_trivoga', component: PopApTrivoga },
]

export default createRouter({
    history: createWebHistory(),
    routes
})
