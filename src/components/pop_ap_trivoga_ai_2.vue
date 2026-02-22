<template>
  <div class="alert-overlay">
    <div class="alert-container">
      <div class="event-badge-top">
        <img src="@/assets/fire-icon.svg" alt="Событие" class="event-icon-large" />
        <span class="event-text-large">{{ eventType }}</span>
      </div>

      <div class="alert-header">
        <span class="car-number">Машина с номером {{ eventData?.Car?.Number || '???' }}</span>
        <span class="object-code">объект {{ eventData?.Platforms?.Name || '???' }}</span>
      </div>

      <div class="alert-footer">
        <button class="reply-btn" @click="handleReply">Ответить</button>
        <div class="redirect-timer">
          <span v-if="countdown > 0">Будет передана другому через {{ Math.floor(countdown / 60) }}:{{ String(countdown % 60).padStart(2, '0') }}</span>
          <span v-else style="color: #ff9800; font-weight: bold;">Передана другому оператору</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.alert-container {
  border: 4px solid #e53935;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Arial', sans-serif;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.event-badge-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.event-icon-large {
  width: 60px;
  height: 60px;
  margin-bottom: 8px;
}

.event-text-large {
  color: #FF0000;
  font-weight: bold;
  font-size: 24px;
}

.alert-header {
  margin-bottom: 12px;
  width: 100%;
  text-align: center;
}

.car-number {
  display: block;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
}


.object-code {
  display: block;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 12px;
}

.detail-item strong {
  color: #333;
}

.alert-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.reply-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.reply-btn:hover {
  background-color: #388e3c;
}

.redirect-timer {
  font-size: 12px;
  font-weight: bold;
  color: #666;
}
</style>
<script setup>
import { ref, computed, onUnmounted, watch } from 'vue';

const props = defineProps({
  eventData: {
    type: Object,
    default: null
  },
  history: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'reply']);

const isVisible = ref(false);
const countdown = ref(1200); // 20 минут = 1200 секунд
let countdownTimer = null;

// Вычисляемые свойства для отображения данных
const eventType = computed(() => {
  if (!props.eventData) return 'СОБЫТИЕ';
  return props.eventData.TypeEvent?.Name || 'СОБЫТИЕ';
});

const carInfo = computed(() => {
  if (!props.eventData?.Car) return 'Неизвестная машина';
  const car = props.eventData.Car;
  const model = car.ModelCar?.Name || '';
  const brand = car.ModelCar?.CarBrand?.Name || '';
  return `Машина ${brand} ${model}`;
});

const locationInfo = computed(() => {
  if (!props.eventData) return '';
  const lat = props.eventData.Latitude?.toFixed(6);
  const lon = props.eventData.Longitude?.toFixed(6);
  if (lat && lon) {
    return `Координаты: ${lat}, ${lon}`;
  }
  return props.eventData.Platforms?.Name || 'Неизвестное местоположение';
});

const eventDetails = computed(() => {
  if (!props.eventData) return null;
  
  const details = {};
  const data = props.eventData;
  
  // Добавляем только ненулевые значения
  if (data.EngineTorque) details.engineTorque = `${data.EngineTorque} Nm`;
  if (data.EngineLoad) details.engineLoad = `${data.EngineLoad}%`;
  if (data.EngineOilPressure) details.engineOilPressure = `${data.EngineOilPressure} kPa`;
  if (data.EngineILTemperature) details.engineTemperature = `${data.EngineILTemperature}°C`;
  if (data.ExhaustGasTemperature) details.exhaustGasTemperature = `${data.ExhaustGasTemperature}°C`;
  if (data.RemainingFuelRealTime) details.remainingFuel = `${data.RemainingFuelRealTime} л`;
  if (data.BatteryVoltage) details.batteryVoltage = `${data.BatteryVoltage} В`;
  if (data.DateTime) details.dateTime = new Date(data.DateTime).toLocaleString('ru-RU');
  
  return Object.keys(details).length > 0 ? details : null;
});

// Форматирование ключей для отображения
const formatKey = (key) => {
  const keyMap = {
    engineTorque: 'Крутящий момент двигателя',
    engineLoad: 'Нагрузка двигателя',
    engineOilPressure: 'Давление масла',
    engineTemperature: 'Температура двигателя',
    exhaustGasTemperature: 'Температура выхлопных газов',
    remainingFuel: 'Остаток топлива',
    batteryVoltage: 'Напряжение батареи',
    dateTime: 'Время события'
  };
  return keyMap[key] || key;
};

const startCountdown = () => {
  countdown.value = 1200; // 20 минут
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value < 0) {
      countdown.value = 0;
      // Не закрываем окно, просто останавливаем таймер
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }
  }, 1000);
};

const close = () => {
  isVisible.value = false;
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  emit('close');
};

const handleReply = () => {
  emit('reply', props.eventData);
  close();
};

// Показываем модальное окно когда получаем данные
watch(() => props.eventData, (newValue) => {
  if (newValue) {
    isVisible.value = true;
    console.log('PopApTrivohaAi2: попап відображено', newValue);
    startCountdown();
  }
}, { immediate: true });

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>