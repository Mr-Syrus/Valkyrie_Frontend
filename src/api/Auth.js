import {api} from "@/api/main_axios.js";
import Cookies from 'js-cookie';

function hasSessionCookie() {
    return !!Cookies.get('session');
}


export async function login(username, password) {
    try {
        const response = await api.post(
            '/auth/login',
            {
                username,
                password,
            }
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}

export async function logout() {
    Cookies.remove('session', { path: '/' });
}

export async function get_user() {
    try {
        const response = await api.get(
            '/auth/user',
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}

export async function check_session() {
    if (!hasSessionCookie()) {
        console.log('Not session');
        return false;
    }
    try {
        const response = await api.get('/auth/check-session');
        return response.data.is_session;
    } catch (error) {
        console.error('Сессия отсутствует или ошибка', error);
        return false;
    }
}