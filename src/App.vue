<script setup>
import {onMounted, onUnmounted, ref} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { check_session } from "@/api/Auth.js";
import { webSocketService } from "@/services/WebSocketService.js";
import Loading from "@/components/Loading.vue";
import Navbar from "@/components/Navbar.vue";
import Login from "@/views/Login.vue";
import PopApTrivohaAi2 from "@/components/pop_ap_trivoga_ai_2.vue";
import AppNotifications from "@/components/AppNotifications.vue";

const router = useRouter();
const route = useRoute();
let loading = ref(false);
let currentEvent = ref(null);
let currentHistory = ref(null);

// Обработчик WebSocket сообщений
const handleWebSocketMessage = (message) => {
  console.log('Получено событие:', message);
  
  if (message.type === 'event' && message.data) {
    currentEvent.value = message.data.eventData;
    currentHistory.value = message.data.history;
  }
};

// Обработчик закрытия всплывающего окна
const handleAlertClose = () => {
  currentEvent.value = null;
  currentHistory.value = null;
};

// Обработчик кнопки "Ответить"
const handleAlertReply = (eventData) => {
  console.log('Ответить на событие:', eventData);
  // Здесь можно добавить логику для перехода на страницу события или открытия формы ответа
  // Например:
  // router.push({ name: 'event-details', params: { id: eventData.Id } });
};

onMounted(async () => {
  const res = await check_session();

  loading.value = true;
  // если сессии нет и мы не на странице логина — редирект
  if (!res && route.name !== 'login') {
    router.push({name: 'login'});
  }
  else if(res && route.name === 'login') {
    router.push({name: 'home'});
  }

  // Если пользователь авторизован, подключаемся к WebSocket
  if (res) {
    webSocketService.onMessage(handleWebSocketMessage);
    webSocketService.connect();
  }
});

onUnmounted(() => {
  // Отключаемся от WebSocket при размонтировании компонента
  webSocketService.offMessage(handleWebSocketMessage);
  webSocketService.disconnect();
});
</script>

<template>
  <div v-if="!loading">
    <Loading />
  </div>
  <div v-else-if="route.name === 'login'">
    <Login />
    <AppNotifications />
  </div>
  <div v-else>
    <Navbar />
    <router-view />
    
    <!-- Всплывающее окно для событий через WebSocket -->
    <PopApTrivohaAi2 
      v-if="currentEvent"
      :eventData="currentEvent"
      :history="currentHistory"
      @close="handleAlertClose"
      @reply="handleAlertReply"
    />

    <!-- Уведомления об ошибках сети -->
    <AppNotifications />
  </div>
</template>

<style scoped>

</style>
