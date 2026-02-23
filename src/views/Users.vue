<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue'
import * as bootstrap from 'bootstrap'
import {all_name_companies, crete_company, put_company, companies_search_by_parents} from '@/api/Companies.js'
import {all_name_post, crete_user, put_user, user_search} from "@/api/Users.js";

// === Данные для компаний ===
const items_companies = ref([])
const items_companies_ar = ref([])

// === Фильтры ===
const sections = ref([
  {title: 'Компания', open: false, items: []},
  {title: 'Пост', open: false, items: []}
])

let posts = ref({})

const items_company = () => sections.value[0].items
const items_company_id_in_name = computed(() =>
    Object.fromEntries(items_company().map(i => [i.id, i.label]))
);
const items_post = () => sections.value[1].items

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
  const activeIds_company = items_company().filter(i => i.checked).map(i => i.id)
  const activeIds_post = items_post().filter(i => i.checked).map(i => i.id)
  const data = await user_search(activeIds_company, activeIds_post);
  if (!data || !Array.isArray(data)) return
  items_companies_ar.value = data
  items_companies.value = data.reduce((acc, item) => {
    const companyId = item.company?.id ?? "";
    if (!acc[companyId]) {
      acc[companyId] = [];
    }
    acc[companyId].push(item);
    return acc;
  }, {});
}

// === Загрузка компаний ===
async function loadingCompanies() {
  const data = await all_name_companies()
  if (!data || !Array.isArray(data)) return
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

// === Загрузка post ===
async function loadingPosts() {
  const data = await all_name_post()
  if (!data || !Array.isArray(data)) return
  sections.value[1].items = data.map(i => ({
    label: i.name,
    checked: false,
    type: 'null',
    q: '',
    id: i.id
  }))
  posts = new Map(
      data.map(i => [i.id, i])
  );

  filterItems()
  await sendRequest()
}

// === Форма добавления компании ===
const form = ref({
  username: '',

  firstname: '',
  lastname: '',
  surname: '',
  password: null,

  decommissioned: false,
  company: '',
  post: '',
})
const error_form = ref("")
const form_id = ref(null)

function resetForm() {
  form.value = {
    username: '',

    firstname: '',
    lastname: '',
    surname: '',
    password: null,

    decommissioned: false,
    company: '',
    post: '',
  }
  error_form.value = ""
  form_id.value = null
}

async function submitForm() {
  console.log(form_id.value, form.value)
  if (form.value.company != null && form.value.company.trim() !== "") {
    const exists = items_company().some(item => item.label === form.value.company)
    if (!exists) {
      error_form.value = 'Имя компании неправильное.'
      return
    }
  }

  if (form.value.post == null && form.value.company.trim() === "") {
    error_form.value = 'Имя должности неправильное.'
  }

  if (form_id.value == null) {
    await crete_user(
        form.value.username,
        form.value.firstname,
        form.value.lastname,
        form.value.surname,
        form.value.password,
        form.value.decommissioned,
        form.value.company,
        form.value.post,
    )
  } else {
    await put_user(
        form_id.value,
        form.value.username,
        form.value.firstname,
        form.value.lastname,
        form.value.surname,
        form.value.password,
        form.value.decommissioned,
        form.value.company,
        form.value.post,
    )
  }
  await loadingCompanies()
  await loadingPosts()

  const modalEl = document.getElementById('addCompanyModal')
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl)
  modalInstance.hide()

  const backdrop = document.querySelector('.modal-backdrop')
  if (backdrop) backdrop.remove()
}

// === Автокомплит ===
const filteredItemsCompany = ref([])
const filteredItemsPost = ref([])
const showDropdownCompany = ref(false)
const showDropdownPost = ref(false)

function filterItems() {
  let query = (form.value.company || '').toLowerCase()
  filteredItemsCompany.value = items_company()
      .filter(item => item.label.toLowerCase().includes(query))
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(0, 5)

  query = (form.value.post || '').toLowerCase()
  filteredItemsPost.value = items_post()
      .filter(item => item.label.toLowerCase().includes(query))
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(0, 5)
}

function selectItemCompany(item) {
  form.value.company = item.label
  showDropdownCompany.value = false
}

function selectItemPost(item) {
  form.value.post = item.label
  showDropdownPost.value = false
}

function hideDropdown() {
  setTimeout(() => showDropdownCompany.value = false, 100)
}

// === Редактирование ===
function editItem(id) {

  console.log(id)
  const user = items_companies_ar.value.find(item => item.user?.id === id)
  if (!user) return
  const modalEl = document.getElementById('addCompanyModal')
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl)
  modalInstance.show()

  form.value = {
    username: user.user.username,

    firstname: user.user.firstname,
    lastname: user.user.username,
    surname: user.user.surname,

    decommissioned: user.user.decommissioned,
    company: user.company?.name ?? '',
    post: user.postType?.name ?? '',
  }
  form_id.value = id
}

// === Развёрнутые компании ===
const expandedCompanies = ref([])

function toggleCompanyExpand(companyId) {
  const idx = expandedCompanies.value.indexOf(companyId)
  if (idx === -1) {
    expandedCompanies.value.push(companyId)
  } else {
    expandedCompanies.value.splice(idx, 1)
  }
}

function isCompanyExpanded(companyId) {
  return expandedCompanies.value.includes(companyId)
}

function getVisibleUsers(users, companyId) {
  if (isCompanyExpanded(companyId) || users.length <= 4) {
    return users
  }
  return users.slice(0, 3)
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
  loadingPosts()
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
            Добавить сотрудника
          </button>
        </div>

        <div class="bg-secondary w-100 mb-3" style="height: 4px;"></div>

        <div class="container">
          <div class="row">
            <div v-for="(users, companyId) in items_companies" :key="companyId"
                 class="p-3 mb-4"
                 style="border: 2px solid var(--color-forms); border-radius: 8px; background-color: transparent;">

              <!-- Верхняя часть блока: треугольник + имя компании -->
              <div class="d-flex align-items-center mb-3">
                <img src="@/assets/triangle.svg" alt="triangle"
                     class="section-icon"
                     :class="{ sectionRotated: isCompanyExpanded(companyId) }"
                     style="width: 20px; height: 20px; margin-right: 8px; cursor: pointer;"
                     @click="toggleCompanyExpand(companyId)"/>
                <div v-if="companyId">
                  <span class="fw-bold">{{items_company_id_in_name[companyId]}}</span>
                </div>
              </div>

              <!-- Пользователи внутри компании -->
              <div class="row">
                <div class="col-3 mb-3" v-for="user in getVisibleUsers(users, companyId)" :key="user.user?.id">
                  <div class="position-relative p-3"
                       style="background-color: #D9D9D9; height: 130px; border-radius: 4px;">
                    <div class="text-start">Ф: {{ user.user.lastname }}</div>
                    <div class="text-start">И: {{ user.user.firstname }}</div>
                    <div class="text-start">О: {{ user.user.surname }}</div>
                    <div class="text-start">пост: {{ user.postType?.name }}</div>
                    <img
                        src="@/assets/edit.svg"
                        class="position-absolute"
                        style="bottom: 5px; right: 5px; width: 20px; height: 20px;"
                        @click="editItem(user.user?.id)"
                    >
                  </div>
                </div>

                <!-- Блок "Ещё N" -->
                <div v-if="!isCompanyExpanded(companyId) && users.length > 4" class="col-3 mb-3">
                  <div class="d-flex align-items-center justify-content-center p-3"
                       style="background-color: #D9D9D9; height: 130px; border-radius: 4px; cursor: pointer; font-size: 1.1rem; font-weight: 600;"
                       @click="toggleCompanyExpand(companyId)">
                    Ещё {{ users.length - 3 }}
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
          <template v-if="form_id==null">
            <h5 class="modal-title">Добавить сотрудника</h5>
          </template>
          <template v-else>
            <h5 class="modal-title">Редактирование сотрудника</h5>
          </template>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Никнейм<span class="text-danger">*</span></label>
              <input v-model="form.username" type="text" class="form-control" required/>
            </div>

            <div class="mb-3">
              <label class="form-label">Фамилия<span class="text-danger">*</span></label>
              <input v-model="form.firstname" type="text" class="form-control" required/>
            </div>
            <div class="mb-3">
              <label class="form-label">Имя<span class="text-danger">*</span></label>
              <input v-model="form.lastname" type="text" class="form-control" required/>
            </div>

            <div class="mb-3">
              <label class="form-label">Отчество</label>
              <input v-model="form.surname" type="text" class="form-control"/>
            </div>

            <div class="mb-3">
              <label class="form-label">Пароль</label>
              <input v-model="form.password" type="password" class="form-control"/>
            </div>

            <div class="mb-3">
              <label class="form-label">Уволен</label>
              <input v-model="form.decommissioned" type="checkbox" class="form-check-input ms-2"/>
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

            <div class="mb-3">
              <label class="form-label">Должность</label>
              <input
                  v-model="form.post"
                  type="text"
                  class="form-control"
                  @input="filterItems"
                  @focus="showDropdownPost = true"
                  @blur="hideDropdown"
              />
              <ul v-if="showDropdownPost && filteredItemsPost.length" class="list-group position-absolute w-100"
                  style="z-index: 1000;">
                <li
                    v-for="item in filteredItemsPost"
                    :key="item.id"
                    class="list-group-item list-group-item-action"
                    @mousedown.prevent="selectItemPost(item)"
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
