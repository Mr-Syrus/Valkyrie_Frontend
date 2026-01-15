<template>
  <div class="alert-container">
    <div class="event-badge-top">
      <img src="@/assets/fire-icon.svg" alt="Пожар" class="event-icon-large" />
      <span class="event-text-large">ПОЖАР</span>
    </div>

    <div class="alert-header">
      <span class="car-number">Машина с номером BNK 568</span>
      <span class="location-label">местоположение</span>
      <span class="object-code">объект FHDU1823</span>
    </div>

<!--    <div class="location-section">-->
<!--    </div>-->

    <div class="alert-footer">
      <button class="reply-btn">Ответить</button>
      <div class="redirect-timer">
        Будет перенаправлено выше через 19:46
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-container {
  border: 4px solid #e53935; /* толще */
  border-radius: 8px;
  padding: 16px;
  font-family: 'Arial', sans-serif;
  max-width: 400px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.event-badge-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.event-icon-large {
  width: 60px; /* увеличили размер */
  height: 60px;
  margin-bottom: 8px;
}

.event-text-large {
  color: #FF0000;
  font-weight: bold;
  font-size: 24px; /* увеличили размер текста */
}

.alert-header {
  margin-bottom: 12px;
  width: 100%;
  text-align: center;
}

.car-number {
  font-weight: bold;
  font-size: 16px;
}


.location-label {
  display: block;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}

.object-code {
  font-weight: bold;
  font-size: 16px;
}

.alert-footer {
  display: flex;
  flex-direction: column; /* таймер под кнопкой */
  align-items: center;    /* центрирование по горизонтали */
  gap: 4px;               /* небольшое расстояние между кнопкой и таймером */
}



.reply-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
}

.reply-btn:hover {
  background-color: #388e3c;
}

.redirect-timer {
  font-size: 12px;
  font-weight: bold;
}
</style>
<script setup lang="ts">
</script>