import {api} from "@/api/main_axios.js";

export async function all_name_post() {
    try {
        const response = await api.get(
            '/users/posts',
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}

export async function crete_user(username, firstname, lastname, surname, password, decommissioned, company, post) {
    try {
        const response = await api.post(
            '/users',
            {username, firstname, lastname, surname, password, decommissioned, company, post}
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}

export async function put_user(id, username, firstname, lastname, surname, password, decommissioned, company, post) {
    try {
        const response = await api.put(
            '/users',
            {id, username, firstname, lastname, surname, password, decommissioned, company, post}
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}

export async function user_search(idsCompany, idsPost) {
    try {
        const response = await api.get(
            '/users/search',
            {
                params: { idsCompany, idsPost },
                paramsSerializer: params => {
                    const query = [];

                    if (params.idsCompany) {
                        params.idsCompany.forEach(id =>
                            query.push(`idsCompany=${id}`)
                        );
                    }

                    if (params.idsPost) {
                        params.idsPost.forEach(id =>
                            query.push(`idsPost=${id}`)
                        );
                    }

                    return query.join('&');
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}
