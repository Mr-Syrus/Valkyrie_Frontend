import {api} from "@/api/main_axios.js";
import Cookies from 'js-cookie';

function hasSessionCookie() {
    return !!Cookies.get('session');
}


export async function all_name_companies() {
    try {
        const response = await api.get(
            '/companies/all_name_companies',
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}
