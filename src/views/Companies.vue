<script setup>
import {reactive, computed, watch, onMounted, ref} from 'vue'
import FiltersPanel from '@/components/FiltersPanel.vue'
import {check_session} from "@/api/Auth.js";
import {all_name_companies} from "@/api/Companies.js";

const items_companies = ref([])
var items = [
  {
    label: 'Loading',
    checked: false,
    type: 'null',
    q: "",
    id: 0
  },
]

const sections = reactive([
      {
        title: 'Материнская компания',
        open: false,
        items: items
      }
    ]
)
let isProcessing = false
let pending = false

watch(
    sections,
    async () => {
      if (isProcessing) {
        pending = true
        return
      }

      isProcessing = true
      do {
        pending = false
        await sendRequest(sections) // твой async-запрос
      } while (pending)

      isProcessing = false
    },
    {deep: true}
)

async function sendRequest(data) {
  // API call
}

async function loadingCompanis() {
  let data = await all_name_companies()
  items.length = 0;
  for (let i in data) {
    items.push({
      label: i.Name,
      checked: false,
      type: 'null',
      q: "",
      id: i.Id
    },)
  }
}

function editItem(id) {
  console.log('Edit item:', id)
  // твоя логика
}

onMounted(async () => {

  loadingCompanis()
  sendRequest(sections)
});
</script>


<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Левая панель -->
      <FiltersPanel :sections="sections"/>

      <!-- Правая часть -->
      <div class="col p-3">
        <!-- Кнопка справа -->
        <div class="d-flex justify-content-end mb-2">
          <button class="btn" :style="{ backgroundColor: 'var(--color-forms)', color: '#000' }">
            Добавить компанию
          </button>
        </div>

        <!-- Полоска под кнопкой -->
        <div class="bg-secondary w-100 mb-3" style="height: 4px;"></div>

        <!-- Элементы-заглушки -->
        <div class="container">
          <div class="row">
            <div class="col-3 mb-3" v-for="item in items_companies" :key="item.id">
              <div class="position-relative p-3" style="background-color: #D9D9D9; height: 130px;">
                <!-- Левый верхний текст -->
                <div class="text-start">
                  Имя: {{ item }}
                </div>
                <div class="text-start">
                  Отпучкавалась от: {{ item }}
                </div>
                <!-- Справа внизу иконка -->
                <img src="@/assets/edit.svg"
                     class="position-absolute"
                     style="bottom: 5px; right: 5px; width: 20px; height: 20px;"
                     @click="editItem(item.id)">
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
