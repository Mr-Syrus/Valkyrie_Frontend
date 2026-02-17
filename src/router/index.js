import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import PopApTrivogaAi from '@/components/pop_ap_trivoga_ai.vue'
import PopApTrivogaAi2 from '@/components/pop_ap_trivoga_ai_2.vue'
import PopApTrivoga from '@/components/pop_ap_trivoga.vue'
import Navbar from '@/components/Navbar.vue'
import Home from "@/views/Home.vue";
import NotFound from "@/views/NotFound.vue";

import Cars from "@/views/Cars.vue";
import Users from "@/views/Users.vue";
import Companies from "@/views/Companies.vue";
import Platform from "@/views/Platform.vue";
import Message from "@/views/Message.vue";

const routes = [
    { path: '/', name: 'home', component: Home },
    { path: '/login', name: 'login', component: Login },

    { path: '/cars', name: 'cars', component: Cars },
    { path: '/users', name: 'users', component: Users },
    { path: '/companies', name: 'companies', component: Companies },
    { path: '/platform', name: 'platform', component: Platform },
    { path: '/message', name: 'message', component: Message },

    { path: '/pop_ap_trivoga_ai', name: 'pop_ap_trivoga_ai', component: PopApTrivogaAi },
    { path: '/pop_ap_trivoga_ai_2', name: 'pop_ap_trivoga_ai_2', component: PopApTrivogaAi2 },
    { path: '/pop_ap_trivoga', name: 'pop_ap_trivoga', component: PopApTrivoga },
    // { path: '/navbar', name: 'Navbar', component: Navbar },

    {
        path: '/:pathMatch(.*)*',  // ловит все несуществующие пути
        name: 'NotFound',
        component: NotFound
    }
]

export default createRouter({
    history: createWebHistory(),
    routes
})
