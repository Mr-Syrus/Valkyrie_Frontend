<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue'
import * as bootstrap from 'bootstrap'
import {crete_cars, put_cars, cars_search, model_cars} from "@/api/Cars.js";
import {platforms_search} from "@/api/Platforms.js";

// === Данные для машин ===
const items_cars = ref([])
const items_cars_ar = ref([])

// === Данные для моделей машин ===
const items_model_cars = ref([])

// === Данные для платформ ===
const items_platforms = ref([])

// === Фильтры ===
const sections = ref([
      {
        title: 'Двигатель',
        open: false,
        items: [
          {
            label: 'крутящий момент',
            checked: false,
            type: 'range',
            min: 0,
            max: 2500,
            q: {min: 0, max: 2500},
            teg: 'engine_torque',
          },
          {
            label: 'нагрузка двигателя (%)',
            checked: false,
            type: 'range',
            min: 0,
            max: 100,
            q: {min: 0, max: 100},
            teg: 'engine_load',
          },
          {
            label: 'давление масла',
            checked: false,
            type: 'range',
            min: 0,
            max: 10,
            q: {min: 0, max: 10},
            teg: 'engine_oil_pressure',
          },
          {
            label: 'температура масла',
            checked: false,
            type: 'range',
            min: -20,
            max: 140,
            q: {min: -20, max: 140},
            teg: 'engine_il_temperature',
          },
          {
            label: 'температура выхлопных газов (EGT)',
            checked: false,
            type: 'range',
            min: 0,
            max: 1000,
            q: {min: 0, max: 1000},
            teg: 'exhaust_gas_temperature',
          },
          {
            label: 'часы работы двигателя (моточасы)',
            checked: false,
            type: 'range',
            min: 0,
            max: 100000,
            q: {min: 0, max: 100000},
            teg: 'engine_operating_hours',
          },
        ]
      },
      {
        title: 'Топливо',
        open: false,
        items: [
          {
            label: 'расход в реальном времени',
            checked: false,
            type: 'range',
            min: 0,
            max: 100,
            q: {min: 0, max: 100},
            teg: 'remaining_fuel_real_time',
          },
          {
            label: 'остаток топлива (%)',
            checked: false,
            type: 'range',
            min: 0,
            max: 100,
            q: {min: 0, max: 100},
            teg: 'remaining_fuel',
          },
        ]
      },
      {
        title: 'Гидравлика',
        open: false,
        items: [
          {
            label: 'давление в гидросистеме',
            checked: false,
            type: 'range',
            min: 0,
            max: 400,
            q: {min: 0, max: 400},
            teg: 'pressure_hydraulic_system',
          },
          {
            label: 'температура гидравлической жидкости',
            checked: false,
            type: 'range',
            min: -20,
            max: 120,
            q: {min: -20, max: 120},
            teg: 'hydraulic_fluid_temperature',
          },
        ]
      },
      {
        title: 'Эксплуатация и телематика',
        open: false,
        items: [
          {
            label: 'геопозиция',
            checked: false,
            q: '',
            type: 'null',
            teg: 'geolocation',
          },
        ]
      },
      {
        title: 'Состояние и обслуживание',
        open: false,
        items: [
          {
            label: 'напряжение АКБ',
            checked: false,
            type: 'range',
            min: 9,
            max: 36,
            q: {min: 9, max: 36},
            teg: 'battery_voltage',
          },
        ]
      },
      {
        title: "Состояние эксплуатации",
        open: false,
        items: [
          {
            label: "Выведено из эксплуатации",
            checked: false,
            q: '',
            type: 'null',
            teg: 'null',
          },
        ]
      },
    ]
)

const sections_is_decommissioned = () => sections.value[5].items[0].checked

let isProcessing = false
let pending = false

async function timeSendRequest() {
  if (isProcessing) {
    pending = true
    return
  }
  isProcessing = true
  do {
    pending = false
    await sendRequest()
  } while (pending)
  isProcessing = false
}

function buildFilterJson(sections) {
  const result = {};

  sections.forEach(section => {
    section.items.forEach(item => {
      const key = item.teg;

      if (!item.checked) {
        // Если элемент не выбран, пропускаем
        return;
      }

      if (item.type === 'range') {
        result[key] = {
          Min: item.q.min,
          Max: item.q.max
        };
      } else if (item.type === 'null' && key !== 'null') {
        result[key] = true;
      }
    });
  });

  return result;
}

async function sendRequest() {
  const data = await cars_search(buildFilterJson(sections.value));
  if (!data || !Array.isArray(data)) return

  const now = new Date()
  const decommissionedFilter = sections_is_decommissioned()

  const isDecommissioned = car =>
      car.endDateOperation && new Date(car.endDateOperation) < now

  let cars = data.map(item => item.car || item.Car || item)

  if (decommissionedFilter) {
    cars = cars.filter(car => isDecommissioned(car))
  } else {
    cars = cars.filter(car => !isDecommissioned(car))
  }

  items_cars_ar.value = cars
  items_cars.value = cars.reduce((acc, car) => {
    const platformId = car.platformId;
    if (!acc[platformId]) {
      acc[platformId] = [];
    }
    acc[platformId].push(car);
    return acc;
  }, {});
}

// === Загрузка моделей машин ===
async function loadingModelCars() {
  const data = await model_cars()
  if (data && Array.isArray(data)) {
    items_model_cars.value = data
  }
}

// === Загрузка платформ ===
async function loadingPlatforms() {
  const data = await platforms_search([], [])
  if (data && Array.isArray(data)) {
    items_platforms.value = data.map(i => ({
      label: i.name || `Платформа ${i.id}`,
      id: i.id
    }))
  }
}

// === Форма добавления машины ===
function generator_clean_form() {
  return {
    startDateOperation: new Date().toISOString().slice(0, 16),
    endDateOperation: null,
    modelCarId: null,
    platformId: null,
    number: "",
    modelCarSearch: "",
    platformSearch: "",
  }
}

const form = ref(generator_clean_form())
const error_form = ref("")
const form_id = ref(null)

function resetForm() {
  form.value = generator_clean_form()
  error_form.value = ""
  form_id.value = null
}

async function submitForm() {
  // Валидация: проверяем, что модель машины выбрана
  if (!form.value.modelCarId) {
    error_form.value = 'Пожалуйста, выберите модель машины из списка.'
    return
  }

  // Валидация: проверяем, что платформа выбрана
  if (!form.value.platformId) {
    error_form.value = 'Пожалуйста, выберите платформу из списка.'
    return
  }

  if (form_id.value == null) {
    await crete_cars(
        form.value.startDateOperation,
        form.value.endDateOperation,
        form.value.modelCarId,
        form.value.platformId,
        form.value.number
    )
  } else {
    await put_cars(
        form_id.value,
        form.value.startDateOperation,
        form.value.endDateOperation,
        form.value.modelCarId,
        form.value.platformId,
        form.value.number
    )
  }

  await sendRequest()

  const modalEl = document.getElementById('addCompanyModal')
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl)
  modalInstance.hide()

  const backdrop = document.querySelector('.modal-backdrop')
  if (backdrop) backdrop.remove()
}

// === Автокомплит ===
const filteredItemsModelCar = ref([])
const filteredItemsPlatform = ref([])
const showDropdownModelCar = ref(false)
const showDropdownPlatform = ref(false)

function filterItems() {
  let query = (form.value.modelCarSearch || '').toLowerCase()
  filteredItemsModelCar.value = items_model_cars.value
      .filter(item => item.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 5)

  query = (form.value.platformSearch || '').toLowerCase()
  filteredItemsPlatform.value = items_platforms.value
      .filter(item => item.label.toLowerCase().includes(query))
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(0, 5)
}

function selectItemModelCar(item) {
  form.value.modelCarId = item.id
  form.value.modelCarSearch = item.name
  showDropdownModelCar.value = false
}

function selectItemPlatform(item) {
  form.value.platformId = item.id
  form.value.platformSearch = item.label
  showDropdownPlatform.value = false
}

function hideDropdownModelCar() {
  setTimeout(() => { showDropdownModelCar.value = false }, 150)
}

function hideDropdownPlatform() {
  setTimeout(() => { showDropdownPlatform.value = false }, 150)
}

// === Редактирование ===
function editItem(id) {
  const car = items_cars_ar.value.find(item => item.id === id)
  console.log('Editing car:', car)

  if (!car) {
    console.error('Car not found with id:', id)
    return
  }

  const modalEl = document.getElementById('addCompanyModal')
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl)
  modalInstance.show()

  form.value = {
    startDateOperation: car.startDateOperation ? car.startDateOperation.slice(0, 16) : '',
    endDateOperation: car.endDateOperation ? car.endDateOperation.slice(0, 16) : null,
    modelCarId: car.modelCarId,
    platformId: car.platformId,
    number: car.number,
    modelCarSearch: car.modelCar?.name || '',
    platformSearch: items_platforms.value.find(p => p.id === car.platformId)?.label || ''
  }
  console.log('Form after setting:', form.value)
  form_id.value = id
}

// Computed для маппинга ID платформы на название
const items_platform_id_to_name = computed(() =>
    Object.fromEntries(items_platforms.value.map(i => [i.id, i.label]))
)

// === Панель фильтров ===
const isCollapsed = ref(false)
const searchQuery = ref('')

const filteredSections = computed(() => {
  if (!searchQuery.value) return sections.value
  return sections.value
      .map(section => ({
        ...section,
        items: section.items.filter(item =>
            item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }))
      .filter(section => section.items.length > 0)
})

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

onMounted(async () => {
  loadingModelCars()
  loadingPlatforms()
  sendRequest()

  const modalEl = document.getElementById('addCompanyModal')
  if (modalEl) {
    modalEl.addEventListener('show.bs.modal', resetForm)
  }
})

onUnmounted(() => {
  const modalEl = document.getElementById('addCompanyModal')
  if (modalEl) {
    modalEl.removeEventListener('show.bs.modal', resetForm)
  }
})
</script>

<template>
  <div class="page-layout">
    <!-- Фильтры -->
    <div class="sidebar-panel bg-color-forms p-3" :style="{ width: isCollapsed ? '60px' : '260px' }" style="transition: width 0.3s;">
        <div v-if="!isCollapsed">
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

          <input
              type="text"
              class="form-control mb-3"
              placeholder="Поиск..."
              v-model="searchQuery"
          />
        </div>

        <div v-for="section in filteredSections" :key="section.title" class="mb-2" v-if="!isCollapsed">
          <div class="fw-bold d-flex align-items-center" style="cursor: pointer;" @click="section.open = !section.open">
            <img
                src="@/assets/triangle.svg"
                alt="toggle"
                class="section-icon"
                :class="{ sectionRotated: section.open }"
            />
            <span class="ms-2">{{ section.title }}</span>
          </div>

          <div v-show="section.open" class="ms-4 mt-1">
            <div v-for="item in section.items" :key="item.label" class="mb-2">
              <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    :id="item.label"
                    v-model="item.checked"
                    @change="timeSendRequest()"
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

        <div v-if="isCollapsed" class="text-center">
          <img
              src="@/assets/triangle.svg"
              alt="expand"
              class="collapse-icon rotatedCollapse"
              @click="toggleCollapse"
          />
        </div>
      </div>

    <!-- Контент -->
    <div class="content-panel p-3">
        <div class="d-flex justify-content-end mb-2">
          <button
              class="btn"
              :style="{ backgroundColor: 'var(--color-forms)', color: '#000' }"
              data-bs-toggle="modal"
              data-bs-target="#addCompanyModal"
          >
            Добавить автомобиль
          </button>
        </div>

        <div class="bg-secondary w-100 mb-3" style="height: 4px;"></div>

        <div class="container">
          <div class="row">
            <div v-for="(cars, platformId) in items_cars" :key="platformId"
                 class="p-3 mb-4"
                 style="border: 2px solid var(--color-forms); border-radius: 8px; background-color: transparent;">

              <!-- Верхняя часть блока: треугольник + имя платформы -->
              <div class="d-flex align-items-center mb-3">
                <img src="@/assets/triangle.svg" alt="triangle"
                     style="width: 20px; height: 20px; margin-right: 8px;"/>
                <div v-if="platformId">
                  <span class="fw-bold">{{
                      items_platform_id_to_name[platformId] || `Платформа ID: ${platformId}`
                    }}</span>
                </div>
              </div>

              <!-- Машины внутри платформы -->
              <div class="row">
                <div class="col-3 mb-3" v-for="car in cars" :key="car.id">
                  <div class="position-relative p-3"
                       style="background-color: #D9D9D9; height: 130px; border-radius: 4px;">
                    <div class="text-start">Номер: {{ car.number }}</div>
                    <div class="text-start">Модель: {{ car.modelCar?.name || 'Не указана' }}</div>
                    <img
                        src="@/assets/edit.svg"
                        class="position-absolute"
                        style="bottom: 5px; right: 5px; width: 20px; height: 20px;"
                        @click="editItem(car.id)"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>

  <!-- Модальное окно -->
  <div class="modal fade" id="addCompanyModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static"
       data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <template v-if="form_id == null">
            <h5 class="modal-title">Добавить автомобиль</h5>
          </template>
          <template v-else>
            <h5 class="modal-title">Редактировать автомобиль</h5>
          </template>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Дата начала эксплуатации<span class="text-danger">*</span></label>
              <input v-model="form.startDateOperation" type="datetime-local" class="form-control" required/>
            </div>

            <div class="mb-3">
              <label class="form-label">Дата окончания эксплуатации</label>
              <input v-model="form.endDateOperation" type="datetime-local" class="form-control"/>
            </div>

            <div class="mb-3">
              <label class="form-label">Модель машины<span class="text-danger">*</span></label>
              <input
                  v-model="form.modelCarSearch"
                  type="text"
                  class="form-control"
                  @input="form.modelCarId = null; filterItems()"
                  @focus="showDropdownModelCar = true; filterItems()"
                  @blur="hideDropdownModelCar"
                  placeholder="Начните вводить название модели..."
              />
              <ul v-if="showDropdownModelCar && filteredItemsModelCar.length" class="list-group position-absolute w-100"
                  style="z-index: 1000;">
                <li
                    v-for="item in filteredItemsModelCar"
                    :key="item.id"
                    class="list-group-item list-group-item-action"
                    @mousedown.prevent="selectItemModelCar(item)"
                >
                  {{ item.name }}
                </li>
              </ul>
            </div>

            <div class="mb-3">
              <label class="form-label">Площадка<span class="text-danger">*</span></label>
              <input
                  v-model="form.platformSearch"
                  type="text"
                  class="form-control"
                  @input="form.platformId = null; filterItems()"
                  @focus="showDropdownPlatform = true; filterItems()"
                  @blur="hideDropdownPlatform"
                  placeholder="Начните вводить название платформы..."
              />
              <ul v-if="showDropdownPlatform && filteredItemsPlatform.length" class="list-group position-absolute w-100"
                  style="z-index: 1000;">
                <li
                    v-for="item in filteredItemsPlatform"
                    :key="item.id"
                    class="list-group-item list-group-item-action"
                    @mousedown.prevent="selectItemPlatform(item)"
                >
                  {{ item.label }}
                </li>
              </ul>
            </div>

            <div class="mb-3">
              <label class="form-label">Номер машины<span class="text-danger">*</span></label>
              <input v-model="form.number" type="text" class="form-control" required
                     placeholder="Введите номер машины" maxlength="11"/>
            </div>
          </div>

          <div v-if="error_form" class="alert alert-danger mt-2 p-2" role="alert">
            {{ error_form }}
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
            <button type="submit" class="btn btn-primary">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-layout {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.sidebar-panel {
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}

.content-panel {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  min-width: 0;
}

.bg-color-forms {
  background-color: #f8f9fa;
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

.list-group {
  max-height: 200px;
  overflow-y: auto;
}
</style>
