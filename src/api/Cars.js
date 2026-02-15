import {api} from "@/api/main_axios.js";


export async function model_cars() {
    try {
        const response = await api.get(
            '/cars/model_cars',
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}

export async function crete_cars(name, address, startDate, endDate, company) {
    try {
        const response = await api.post(
            '/cars',
            {name, address, startDate, endDate, company}
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}

export async function put_cars(id, name, address, startDate, endDate, company) {
    try {
        const response = await api.put(
            '/cars',
            {id, name, address, startDate, endDate, company}
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return null;
    }
}

export async function cars_search(filterJson) {
    try {
        const response = await api.get(
            '/cars/search',
            {
                params: {
                    filterJson: JSON.stringify(filterJson) // превращаем объект в строку
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return [];
    }
}
