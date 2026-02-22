<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue'
import * as bootstrap from 'bootstrap'
import {all_name_companies, crete_company, put_company, companies_search_by_parents} from '@/api/Companies.js'

// === Данные для компаний ===
const items_companies = ref([])

// === Фильтры ===
const sections = ref([
  {title: 'Материнская компания', open: false, items: []}
])

const items = () => sections.value[0].items

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

async function sendRequest() {
  const activeIds = items().filter(i => i.checked).map(i => i.id)
  items_companies.value = await companies_search_by_parents(activeIds)
}

// === Загрузка компаний ===
async function loadingCompanies() {
  const data = await all_name_companies()
  sections.value[0].items = data.map(i => ({
    label: i.name,
    checked: false,
    type: 'null',
    q: '',
    id: i.id
  }))
  filterItems()
  await sendRequest()
}

// === Форма добавления компании ===
const form = ref({name: '', parent_company: ''})
const error_form = ref("")
const form_id = ref(null)

function resetForm() {
  form.value = {name: '', parent_company: ''}
  error_form.value = ""
  form_id.value = null
}

async function submitForm() {
  if (form.value.parent_company != null && form.value.parent_company.trim() !== "") {
    const exists = items().some(item => item.label === form.value.parent_company)
    if (!exists) {
      error_form.value = 'Имя материнской компании неправильное.'
      return
    }
  }
  if (form_id.value == null) {
    await crete_company(form.value.name, form.value.parent_company)
  } else {
    await put_company(form_id.value, form.value.name, form.value.parent_company)
  }
  await loadingCompanies()

  const modalEl = document.getElementById('addCompanyModal')
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl)
  modalInstance.hide()

  const backdrop = document.querySelector('.modal-backdrop')
  if (backdrop) backdrop.remove()
}

// === Автокомплит ===
const filteredItems = ref([])
const showDropdown = ref(false)

function filterItems() {
  const query = (form.value.parent_company || '').toLowerCase()
  filteredItems.value = items()
      .filter(item => item.label.toLowerCase().includes(query))
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(0, 5)
}

function selectItem(item) {
  form.value.parent_company = item.label
  showDropdown.value = false
}

function hideDropdown() {
  setTimeout(() => showDropdown.value = false, 100)
}

// === Редактирование ===
function editItem(id) {
  console.log('Редактируем компанию', id)

  const company = items_companies.value.find(item => item.companyId === id)
  const modalEl = document.getElementById('addCompanyModal')
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl)
  modalInstance.show()

  form.value = {name: company.companyName, parent_company: company.parentsCompanyName}
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
  loadingCompanies()
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
            Добавить компанию
          </button>
        </div>

        <div class="bg-secondary w-100 mb-3" style="height: 4px;"></div>

        <div class="container">
          <div class="row">
            <div class="col-3 mb-3" v-for="item in items_companies" :key="item.companyId">
              <div class="position-relative p-3" style="background-color: #D9D9D9; height: 130px;">
                <div class="text-start">Имя: {{ item.companyName }}</div>
                <div class="text-start" v-if="item.parentsCompanyName">
                  Ответвилась от: {{ item.parentsCompanyName }}
                </div>
                <img
                    src="@/assets/edit.svg"
                    class="position-absolute"
                    style="bottom: 5px; right: 5px; width: 20px; height: 20px;"
                    @click="editItem(item.companyId)"
                >
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
          <h5 class="modal-title">Добавить компанию</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Название компании<span class="text-danger">*</span></label>
              <input v-model="form.name" type="text" class="form-control" required/>
            </div>

            <div class="mb-3">
              <label class="form-label">Компания владелец</label>
              <input
                  v-model="form.parent_company"
                  type="text"
                  class="form-control"
                  @input="filterItems"
                  @focus="showDropdown = true"
                  @blur="hideDropdown"
              />
              <ul v-if="showDropdown && filteredItems.length" class="list-group position-absolute w-100"
                  style="z-index: 1000;">
                <li
                    v-for="item in filteredItems"
                    :key="item.id"
                    class="list-group-item list-group-item-action"
                    @mousedown.prevent="selectItem(item)"
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
