import {api} from "@/api/main_axios.js";

export async function message_search(filterJson) {
    try {
        const response = await api.get(
            '/message/search',
            {
                params: {
                    filterJson: JSON.stringify(filterJson)
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('ошибка', error);
        return [];
    }
}
