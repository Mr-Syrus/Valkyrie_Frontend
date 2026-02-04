<script setup>
import {onMounted, ref} from 'vue';
import {get_user, logout} from "@/api/Auth.js";
import { useRouter } from 'vue-router';

const router = useRouter();
let username = ref("");

onMounted(async () => {
  const res = await get_user();
  username.value = res.username
});

async function volumeClick(){

}

async function logoutClick(){
  await logout()
  await router.push({name: 'login'});
}

</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark navbar-custom px-3">
    <!-- Левая часть -->
    <div class="d-flex align-items-center">
      <router-link to="/" class="d-flex align-items-center text-decoration-none text-light me-3">
        <img src="@/assets/logo_min_gren.svg" alt="fire icon" class="icon"/>
      </router-link>
      <div class="d-flex align-items-center text-decoration-none text-light me-3">
        <span class="fw-bold">{{ username }}</span>
      </div>
    </div>

    <div class="ms-auto d-flex align-items-center">
<!--      <button class="btn p-0 d-flex align-items-center text-light me-3" @click="volumeClick">-->
<!--        <img src="@/assets/volume.svg" alt="volume icon" class="icon"/>-->
<!--      </button>-->

      <button class="btn p-0 d-flex align-items-center text-light me-3" @click="logoutClick">
        <img src="@/assets/logout.svg" alt="logout icon" class="icon"/>
      </button>
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