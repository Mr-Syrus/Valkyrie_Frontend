<script setup>
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark navbar-custom px-3">
    <!-- Левая часть -->
    <div class="d-flex align-items-center">
      <router-link to="/" class="d-flex align-items-center text-decoration-none text-light me-3">
        <img src="@/assets/logo_min_gren.svg" alt="fire icon" class="icon" />
      </router-link>

      <div class="d-flex align-items-center text-decoration-none text-light me-3">
        <span class="fw-bold">&lt;Username&gt;</span>
      </div>

<!--      <router-link to="/support" class="d-flex align-items-center text-decoration-none text-light me-3">-->
<!--        <span class="fw-bold">поддержка</span>-->
<!--      </router-link>-->

    </div>


    <div class="ms-auto d-flex align-items-center">
      <router-link to="/" class="d-flex align-items-center text-decoration-none text-light me-3">
        <img src="@/assets/volume.svg" alt="fire icon" class="icon" />
      </router-link>
      <router-link to="/" class="d-flex align-items-center text-decoration-none text-light me-3">
      <img src="@/assets/logout.svg" alt="fire icon" class="icon" />
    </router-link>
    </div>
  </nav>
</template>

<style scoped>
.navbar-custom {
  background-color: var(--color-forms) !important;
  min-height: 50px !important;
  padding: 1rem 1rem !important;
}

.navbar-custom .fw-bold {
  font-size: 1.3rem;
}

.navbar-custom .btn {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
}
</style>