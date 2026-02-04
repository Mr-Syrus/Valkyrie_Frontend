import axios from 'axios';

// создаём инстанс
export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});