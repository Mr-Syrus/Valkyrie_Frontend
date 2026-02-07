<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  sections: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['update:sections'])

const isCollapsed = ref(false)
const searchQuery = ref('')

// Локальная реактивная копия секций
const localSections = ref([])

// Обновляем локальные секции при изменении пропсов
watch(
    () => props.sections,
    (newSections) => {
      localSections.value = newSections.map(section => ({
        ...section,
        open: section.open ?? false,
        items: section.items.map(item => ({
          ...item,
          checked: item.checked ?? false,
          q: item.q ?? (item.type === 'range' ? { min: item.min, max: item.max } : '')
        }))
      }))
    },
    { immediate: true, deep: true }
)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const filteredSections = computed(() => {
  if (!searchQuery.value) return localSections.value
  return localSections.value
      .map(section => ({
        ...section,
        items: section.items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }))
      .filter(section => section.items.length > 0)
})

watch(
    localSections,
    (newVal) => {
      emit('update:sections', newVal)
    },
    { deep: true }
)
</script>

<template>
  <div :class="`col-${isCollapsed ? 1 : 3} bg-color-forms p-3`" style="transition: width 0.3s;">
    <div v-if="!isCollapsed">
      <!-- Заголовок и кнопка сворачивания -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="m-0">Фильтры</h5>
        <img
            src="@/assets/triangle.svg"
            alt="collapse"
            class="collapse-icon"
            :class="{ rotatedCollapse: isCollapsed }"
            @click="toggleCollapse"
        />
      </div>

      <!-- Поле поиска -->
      <input
          type="text"
          class="form-control mb-3"
          placeholder="Поиск..."
          v-model="searchQuery"
      />
    </div>

    {{localSections}}
    <!-- Контент -->
    <div v-if="!isCollapsed">
      <div v-for="section in filteredSections" :key="section.title" class="mb-2">
        <!-- Заголовок секции -->
        <div
            class="fw-bold d-flex align-items-center"
            style="cursor: pointer;"
            @click="section.open = !section.open"
        >
          <img
              src="@/assets/triangle.svg"
              alt="toggle"
              class="section-icon"
              :class="{ sectionRotated: section.open }"
          />
          <span class="ms-2">{{ section.title }}</span>
        </div>

        <!-- Содержимое секции -->
        <div v-show="section.open" class="ms-4 mt-1">
          <div v-for="item in section.items" :key="item.label" class="mb-2">
            <div class="form-check">
              <input
                  class="form-check-input"
                  type="checkbox"
                  :id="item.label"
                  v-model="item.checked"
              >
              <label class="form-check-label" :for="item.label">{{ item.label }}</label>
            </div>

            <!-- Поля для активного чекбокса -->
            <div v-if="item.checked" class="ms-3 mt-1">
              <template v-if="item.type === 'range'">
                <input
                    type="number"
                    placeholder="От"
                    v-model.number="item.q.min"
                    class="form-control mb-1"
                    :min="item.min"
                    :max="item.max"
                >
                <input
                    type="number"
                    placeholder="До"
                    v-model.number="item.q.max"
                    class="form-control"
                    :min="item.min"
                    :max="item.max"
                >
              </template>

              <template v-else-if="item.type === 'null'">
              </template>

              <template v-else>
                <input
                    type="text"
                    placeholder="Введите значение"
                    v-model="item.q"
                    class="form-control"
                >
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопка раскрытия, когда свернуто -->
    <div v-if="isCollapsed" class="text-center">
      <img
          src="@/assets/triangle.svg"
          alt="expand"
          class="collapse-icon rotatedCollapse"
          @click="toggleCollapse"
      />
    </div>
  </div>
</template>

<style>
.bg-color-forms {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.collapse-icon {
  width: 16px;
  height: 16px;
  cursor: pointer;
  transition: transform 0.3s;
  transform: rotate(0deg);
}

.rotatedCollapse {
  transform: rotate(90deg);
}

.section-icon {
  width: 12px;
  height: 12px;
  transition: transform 0.3s;
  transform: rotate(-90deg);
}

.sectionRotated {
  transform: rotate(0deg);
}
</style>
