<template>
  <div class="loading-container">
    <img src="@/assets/big_logo.svg" alt="Loading" class="logo" />
  </div>
</template>

<script>
export default {
  name: "Loading",
};
</script>

<style scoped>
.loading-container {
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  height: 30vh;
  width: auto;
}
</style>