<script setup>
import { useNotifications } from '@/composables/useNotifications.js'

const { notifications, removeNotification } = useNotifications()
</script>

<template>
  <div class="notifications-container">
    <transition-group name="notification">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="notification-item"
        :class="n.type"
        role="alert"
      >
        <span class="notification-message">{{ n.message }}</span>
        <button class="notification-close" @click="removeNotification(n.id)" aria-label="Закрыть">&times;</button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.notifications-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 380px;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  font-size: 14px;
  color: #fff;
  min-width: 260px;
}

.notification-item.error {
  background-color: #dc3545;
}

.notification-item.success {
  background-color: #198754;
}

.notification-item.warning {
  background-color: #ffc107;
  color: #212529;
}

.notification-item.info {
  background-color: #0dcaf0;
  color: #212529;
}

.notification-message {
  flex: 1;
  word-break: break-word;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  opacity: 0.8;
  flex-shrink: 0;
}

.notification-close:hover {
  opacity: 1;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
