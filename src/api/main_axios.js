import axios from 'axios';
import { useNotifications } from '@/composables/useNotifications.js';
import {useRoute, useRouter} from 'vue-router';

const router = useRouter();
const route = useRoute();

const { addNotification } = useNotifications();

export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            const detail = typeof data === 'string' && data.trim()
                ? data.trim()
                : data?.detail || data?.message || '';
            if (status === 401) {
                if (route.name !== 'login') {
                    addNotification(detail || 'Необходима авторизация (401)');
                    router.push({name: 'login'}).then(c=>console.log(c));
                }
            } else if (status === 403) {
                addNotification(detail || 'Доступ запрещён (403)');
            } else if (status === 404) {
                addNotification(detail || `Ресурс не найден (404)`);
            } else if (status >= 500) {
                addNotification(detail || `Ошибка сервера (${status})`);
            } else {
                addNotification(detail || `Ошибка запроса (${status})`);
            }
        } else if (error.request) {
            addNotification('Нет соединения с сервером');
        } else {
            addNotification(`Ошибка: ${error.message}`);
        }
        return Promise.reject(error);
    }
);