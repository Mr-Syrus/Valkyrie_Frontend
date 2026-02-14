import {api} from "@/api/main_axios.js";


export async function crete_platforms(name, address, startDate, endDate, company) {
    try {
        const response = await api.post(
            '/platforms',
            {name, address, startDate, endDate, company}
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}

export async function put_platforms(id, name, address, startDate, endDate, company) {
    try {
        const response = await api.put(
            '/platforms',
            {id, name, address, startDate, endDate, company}
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}

export async function platforms_search(idsCompany, idsPost) {
    try {
        const response = await api.get(
            '/platforms/search',
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
