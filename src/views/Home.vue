<template>
  <div class="container mt-4">
    <div class="row g-3">
      <div
          class="col-3"
          v-for="(url, name) in squares"
          :key="name"
      >
        <router-link :to="url" class="square d-flex justify-content-center align-items-center">
          {{ name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
const squares = {
  "Машины": "/cars",
  "Сотрудники": "/users",
  "Компании": "/companies",
  "Карьеры": "/platform",
  "Сообщение": "/message"
};
</script>

<style scoped>
.square {
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: #D9D9D9; /* фон квадратов */
  border-radius: min(60px, 20%); /* скругление не больше 20% ширины */
  color: #000000; /* цвет текста */
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  text-decoration: none; /* убираем подчеркивание ссылок */
}
</style>
