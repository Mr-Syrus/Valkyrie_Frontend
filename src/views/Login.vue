<template>
  <div class="row vh-100" id="login-page">
    <div class="left-side col-6 d-flex flex-column justify-content-center align-items-center p-4">
      <img src="@/assets/big_logo.svg" alt="Logo" class="mb-4" style="width: 80px; height: auto;">
      <form class="w-100">
        <div class="mb-3">
          <input type="text" class="form-control" placeholder="Логин">
        </div>
        <div class="mb-3">
          <input type="password" class="form-control" placeholder="Пароль">
        </div>
        <button type="submit" class="btn btn-warning w-100">Вход</button>
      </form>
    </div>

    <div class="right-side col-6 position-relative">
      <div class="right-fill"></div>
    </div>
  </div>
</template>

<style scoped>
#login-page {
  --color-left: var(--color-background);
  --color-right: var(--color-forms);
}

.left-side {
  background-color: var(--color-left);
}

.right-side {
  background-color: var(--color-left); /* фон для пустоты */
  overflow: hidden;
}

.right-fill {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-right); /* видимая часть */
  clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%);
}
</style>
