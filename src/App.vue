<script setup>
import {onMounted, ref} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { check_session } from "@/api/Auth.js";
import Loading from "@/components/Loading.vue";
import Navbar from "@/components/Navbar.vue";
import Login from "@/views/Login.vue";

const router = useRouter();
const route = useRoute();
let loading = ref(false);

onMounted(async () => {
  const res = await check_session();

  loading.value= true;
  // если сессии нет и мы не на странице логина — редирект
  if (!res && route.name !== 'login') {
    router.push({name: 'login'});
  }
  else if(res && route.name === 'login') {
    router.push({name: 'home'});
  }

});
</script>

<template>
  <div v-if="!loading">
    <Loading />
  </div>
  <div v-else-if="route.name === 'login'">
    <Login />
  </div>
  <div v-else>
    <Navbar />
    <router-view />
  </div>
</template>

<style scoped>

</style>
