import { reactive } from 'vue'

let nextId = 0

const notifications = reactive([])

export function useNotifications() {
    function addNotification(message, type = 'error', duration = 5000) {
        const id = ++nextId
        notifications.push({ id, message, type })

        if (duration > 0) {
            setTimeout(() => removeNotification(id), duration)
        }
    }

    function removeNotification(id) {
        const index = notifications.findIndex(n => n.id === id)
        if (index !== -1) notifications.splice(index, 1)
    }

    return { notifications, addNotification, removeNotification }
}
