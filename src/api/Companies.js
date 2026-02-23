import {api} from "@/api/main_axios.js";

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

export async function crete_company(name, parents, isDecommissioned = false) {
    if (parents==="")
        parents= null
    try {
        const response = await api.post(
            '/companies',
            {name, parents, isDecommissioned}
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}

export async function put_company(id, name, parents, isDecommissioned = false) {
    if (parents==="")
        parents= null
    try {
        const response = await api.put(
            '/companies',
            {id, name, parents, isDecommissioned}
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}

export async function companies_search_by_parents(ids) {
    try {
        const response = await api.get(
            '/companies/search',
            {
                params: { ids },
                paramsSerializer: params => {
                    return params.ids.map(id => `ids=${id}`).join('&');
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}
