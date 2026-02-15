<script setup>
import {ref, computed, onMounted} from 'vue'
import * as bootstrap from 'bootstrap'
import {all_name_companies, crete_company, put_company, companies_search_by_parents} from '@/api/Companies.js'
import {all_name_post, crete_user, put_user, user_search} from "@/api/Users.js";
import {crete_platforms, platforms_search, put_platforms} from "@/api/Platforms.js";
import {cars_search} from "@/api/Cars.js";

// === Данные для компаний ===
const items_companies = ref([])
const items_companies_ar = ref([])

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
            q: { min: 0, max: 2500 },
            teg: 'engine_torque',
          },
          {
            label: 'нагрузка двигателя (%)',
            checked: false,
            type: 'range',
            min: 0,
            max: 100,
            q: { min: 0, max: 100 },
            teg: 'engine_load',
          },
          {
            label: 'давление масла',
            checked: false,
            type: 'range',
            min: 0,
            max: 10,
            q: { min: 0, max: 10 },
            teg: 'engine_oil_pressure',
          },
          {
            label: 'температура масла',
            checked: false,
            type: 'range',
            min: -20,
            max: 140,
            q: { min: -20, max: 140 },
            teg: 'engine_il_temperature',
          },
          {
            label: 'температура выхлопных газов (EGT)',
            checked: false,
            type: 'range',
            min: 0,
            max: 1000,
            q: { min: 0, max: 1000 },
            teg: 'exhaust_gas_temperature',
          },
          {
            label: 'часы работы двигателя (моточасы)',
            checked: false,
            type: 'range',
            min: 0,
            max: 100000,
            q: { min: 0, max: 100000 },
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
            q: { min: 0, max: 100 },
            teg: 'remaining_fuel_real_time',
          },
          {
            label: 'остаток топлива (%)',
            checked: false,
            type: 'range',
            min: 0,
            max: 100,
            q: { min: 0, max: 100 },
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
            q: { min: 0, max: 400 },
            teg: 'pressure_hydraulic_system',
          },
          {
            label: 'температура гидравлической жидкости',
            checked: false,
            type: 'range',
            min: -20,
            max: 120,
            q: { min: -20, max: 120 },
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
            q: { min: 9, max: 36 },
            teg: 'battery_voltage',
          },
        ]
      },
    ]
)

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
        // Берем текущий диапазон из q
        result[key] = {
          Min: item.q.min,
          Max: item.q.max
        };
      } else if (item.type === 'null') {
        // Для null/checkbox ставим true
        result[key] = true;
      }
    });
  });

  return result;
}
async function sendRequest() {
  const data = await cars_search(buildFilterJson(sections.value));

  items_companies_ar.value = data
  items_companies.value = data.reduce((acc, item) => {
    const companyId = item.platformId;
    if (!acc[companyId]) {
      acc[companyId] = [];
    }

    acc[companyId].push(item);
    return acc;
  }, {});
}

// === Форма добавления компании ===
function generator_clirn_from() {
  return{
    startDateOperation: new Date().toISOString().slice(0, 16),
    endDateOperation: null,
    modelCarId: null,
    platformId: null,
    number: "",
  }
}
const form = ref(generator_clirn_from())
const error_form = ref("")
const form_id = ref(null)

function resetForm() {
  form.value = generator_clirn_from()
  error_form.value = ""
  form_id.value = null
}

async function submitForm() {
  if (form_id.value == null) {
    await crete_platforms(
        form.value.startDateOperation,
        form.value.endDateOperation,
        form.value.modelCarId,
        form.value.platformId,
        form.value.number
    )
  } else {
    await put_platforms(
        form_id.value,
        form.value.startDateOperation,
        form.value.endDateOperation,
        form.value.modelCarId,
        form.value.platformId,
        form.value.number
    )
  }

  const modalEl = document.getElementById('addCompanyModal')
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl)
  modalInstance.hide()

  const backdrop = document.querySelector('.modal-backdrop')
  if (backdrop) backdrop.remove()
}

// === Автокомплит ===

function filterItems() {

}

function selectItemCompany(item) {
  form.value.company = item.label

}

function hideDropdown() {
  setTimeout(() => showDropdownCompany.value = false, 100)
}

// === Редактирование ===
function editItem(id) {
  const platform = items_companies_ar.value.find(item => item.id === id)
  const modalEl = document.getElementById('addCompanyModal')
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl)
  modalInstance.show()

  form.value = platform
  form.value.startDate = platform.startDateOperation.slice(0, 16);
  form.value.endDate = platform.endDateOperation ? platform.endDate.slice(0, 16) : null;
  form_id.value = id
}

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

onMounted(() => {
  const modalEl = document.getElementById('addCompanyModal')
  modalEl.addEventListener('show.bs.modal', resetForm)
})
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Фильтры -->
      <div :class="`col-${isCollapsed ? 1 : 3} bg-color-forms p-3`" style="transition: width 0.3s;">
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
      <div class="col p-3">
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
            <div v-for="(platforms, companyId) in items_companies" :key="companyId"
                 class="p-3 mb-4"
                 style="border: 2px solid var(--color-forms); border-radius: 8px; background-color: transparent;">

              <!-- Верхняя часть блока: треугольник + имя компании -->
              <div class="d-flex align-items-center mb-3">
                <img src="@/assets/triangle.svg" alt="triangle"
                     style="width: 20px; height: 20px; margin-right: 8px;"/>
                <div v-if="companyId">
                  <span class="fw-bold">{{ items_company_id_in_name[companyId] }}</span> <!-- имя компании для теста -->
                </div>
              </div>

              <!-- Пользователи внутри компании -->
              <div class="row">
                <div class="col-3 mb-3" v-for="platform in platforms" :key="platform.id">
                  <div class="position-relative p-3"
                       style="background-color: #D9D9D9; height: 130px; border-radius: 4px;">
                    <div class="text-start">Name: {{ platform.name }}</div>
                    <img
                        src="@/assets/edit.svg"
                        class="position-absolute"
                        style="bottom: 5px; right: 5px; width: 20px; height: 20px;"
                        @click="editItem(platform.id)"
                    >
                  </div>
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
          <h5 class="modal-title">Добавить автомобиль</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">startDate<span class="text-danger">*</span></label>
              <input v-model="form.startDate" type="datetime-local" class="form-control" required/>
            </div>

            <div class="mb-3">
              <label class="form-label">endDate</label>
              <input v-model="form.endDate" type="datetime-local" class="form-control"/>
            </div>

            <div class="mb-3">
              <label class="form-label">Компания</label>
              <input
                  v-model="form.company"
                  type="text"
                  class="form-control"
                  @input="filterItems"
                  @focus="showDropdownCompany = true"
                  @blur="hideDropdown"
              />
              <ul v-if="showDropdownCompany && filteredItemsCompany.length" class="list-group position-absolute w-100"
                  style="z-index: 1000;">
                <li
                    v-for="item in filteredItemsCompany"
                    :key="item.id"
                    class="list-group-item list-group-item-action"
                    @mousedown.prevent="selectItemCompany(item)"
                >
                  {{ item.label }}
                </li>
              </ul>
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

.list-group {
  max-height: 200px;
  overflow-y: auto;
}
</style>
