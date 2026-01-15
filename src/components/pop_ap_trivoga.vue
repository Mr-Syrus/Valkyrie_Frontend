<template>
  <div class="popup">
    <div class="popup-content">
      <img src="@/assets/fire-icon.svg" alt="fire icon" class="icon" />
      <p class="center-text">Машина с номером &lt;BNK 568&gt;</p>
      <p class="center-text">&lt;пожар&gt;</p>
      <p class="center-text">местоположение</p>
      <p class="center-text">объект &lt;FHDU1823&gt;</p>

      <button class="reply-btn">Ответить</button>

      <p class="small-text">Будет перенаправлено выше через 19:46</p>
    </div>
  </div>
</template>

<script setup>
// Скриптов пока не требуется
</script>

<style scoped>
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 10px solid #FF0000;
  border-radius: 8px;
  padding: 20px;
  min-width: 250px;
}

.popup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px; /* было 10px, уменьшили */
}

.center-text {
  text-align: center;
  font-weight: 500;
  margin: 1px 0; /* небольшой вертикальный отступ */
}

.reply-btn {
  background-color: #40FF46;
  color: black;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.reply-btn:hover {
  opacity: 0.9;
}

.small-text {
  font-size: 12px;
  color: #555;
  margin-top: 5px;
  text-align: center;
}
</style>
