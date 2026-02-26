<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue'
import * as bootstrap from 'bootstrap'
import {message_search} from "@/api/Messages.js";

// === Данные для сообщений ===
const items_messages = ref([])
const items_messages_ar = ref([])

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
])

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
        return;
      }

      if (item.type === 'range') {
        result[key] = {
          Min: item.q.min,
          Max: item.q.max
        };
      } else if (item.type === 'null') {
        result[key] = true;
      }
    });
  });

  return result;
}

async function sendRequest() {
  const data = await message_search(buildFilterJson(sections.value));
  if (!data || !Array.isArray(data)) return

  items_messages_ar.value = data.map(item => ({
    event: item.event || item.Event,
    historys: item.historys || item.Historys || []
  }))

  // Группируем по platformId
  items_messages.value = items_messages_ar.value.reduce((acc, item) => {
    if (!item.event) return acc
    const platformId = item.event.platformId

    if (!acc[platformId]) {
      acc[platformId] = [];
    }

    acc[platformId].push(item);
    return acc;
  }, {});
}

// Computed для маппинга ID платформы на название
const items_platform_id_to_name = computed(() => {
  const map = {};
  items_messages_ar.value.forEach(item => {
    if (item.event && item.event.platforms) {
      map[item.event.platformId] = item.event.platforms.name;
    }
  });
  return map;
})

// Computed для маппинга ID платформы на адрес
const items_platform_id_to_address = computed(() => {
  const map = {};
  items_messages_ar.value.forEach(item => {
    if (item.event && item.event.platforms) {
      map[item.event.platformId] = item.event.platforms.address;
    }
  });
  return map;
})

// === Просмотр события ===
const selectedMsg = ref(null)

function displayVal(v) {
  return v !== null && v !== undefined ? v : '—'
}

function displayInterval(v) {
  if (v === null || v === undefined) return '—';

  // если это не строка — вернуть как есть
  if (typeof v !== 'string') return v;

  if (!v) return '—';

  let days = 0;
  let timePart = v;

  if (v.includes('.')) {
    const parts = v.split('.');
    days = parseInt(parts[0], 10);
    timePart = parts[1];
  }

  if (days > 0) {
    return `${days} дней ${timePart}`;
  }

  return timePart;
}

function openEventModal(msg) {
  selectedMsg.value = msg
  const modalEl = document.getElementById('eventViewModal')
  bootstrap.Modal.getOrCreateInstance(modalEl).show()
}

function closeEventModal() {
  const modalEl = document.getElementById('eventViewModal')
  bootstrap.Modal.getOrCreateInstance(modalEl).hide()
  const backdrop = document.querySelector('.modal-backdrop')
  if (backdrop) backdrop.remove()
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

onMounted(async () => {
  await sendRequest()
  const modalEl = document.getElementById('eventViewModal')
  if (modalEl) {
    modalEl.addEventListener('hidden.bs.modal', () => {
      selectedMsg.value = null
    })
  }
})

onUnmounted(() => {
  const modalEl = document.getElementById('eventViewModal')
  if (modalEl) {
    bootstrap.Modal.getOrCreateInstance(modalEl).dispose()
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

                      @change="timeSendRequest()"
                  >
                  <input
                      type="number"
                      placeholder="До"
                      v-model.number="item.q.max"
                      class="form-control"
                      :min="item.min"
                      :max="item.max"

                      @change="timeSendRequest()"
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

                      @change="timeSendRequest()"
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
        <div class="bg-secondary w-100 mb-3" style="height: 4px;"></div>

        <div class="container">
          <div class="row">
            <div v-for="(messages, platformId) in items_messages" :key="platformId"
                 class="p-3 mb-4"
                 style="border: 2px solid var(--color-forms); border-radius: 8px; background-color: transparent;">

              <!-- Верхняя часть блока: треугольник + платформа -->
              <div class="d-flex align-items-center mb-3">
                <img src="@/assets/triangle.svg" alt="triangle"
                     style="width: 20px; height: 20px; margin-right: 8px;"/>
                <div v-if="platformId">
                  <span class="fw-bold">Площадка {{
                      items_platform_id_to_name[platformId] || `ID: ${platformId}`
                    }}</span>
                  <div class="text-muted small">Адрес площадки:
                    {{ items_platform_id_to_address[platformId] || 'Не указан' }}
                  </div>
                </div>
              </div>

              <!-- Сообщения внутри платформы -->
              <div class="row">
                <div class="col-4 mb-3" v-for="msg in messages" :key="msg.event.id">
                  <div class="position-relative p-3"
                       :style="{
                         backgroundColor: msg.event.typeEvent?.name !== 'SOS' ? '#FFFFFF' : (msg.historys?.some(h => h.answer) ? '#D4EDDA' : '#F8D7DA'),
                         height: '200px', borderRadius: '4px', cursor: 'pointer'
                       }"
                       @click="openEventModal(msg)">
                    <div class="text-start"><strong>Тип:</strong> {{ msg.event.typeEvent?.name || 'Не указан' }}</div>
                    <div class="text-start"><strong>Машина:</strong> {{ msg.event.car?.number || 'Не указана' }}</div>
                    <div class="text-start"><strong>Дата:</strong>
                      {{ new Date(msg.event.dateTime).toLocaleString('ru-RU') }}
                    </div>
                    <div class="text-start"><strong>Координаты:</strong> {{ msg.event.latitude }},
                      {{ msg.event.longitude }}
                    </div>
                    <div class="text-start mt-2">
                      <template v-if="msg.event.typeEvent?.name !== 'SOS'">
                        <span class="badge bg-secondary">Не требует реакции</span>
                      </template>
                      <template v-else>
                        <span v-if="msg.historys?.some(h => h.answer)" class="badge bg-success">Отвечено</span>
                        <span v-else class="badge bg-danger">Нет ответа</span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>

  <!-- Модальное окно просмотра события -->
  <div class="modal fade" id="eventViewModal" tabindex="-1" aria-hidden="true"
       data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title">Событие #{{ selectedMsg?.event.id }}</h5>
          <button type="button" class="btn-close" @click="closeEventModal"></button>
        </div>

        <div class="modal-body" v-if="selectedMsg">

          <!-- Основная информация -->
          <h6 class="fw-bold mb-2">Основная информация</h6>
          <div class="row mb-3">
            <div class="col-6">
              <div class="mb-2"><strong>Тип события:</strong> {{ selectedMsg.event.typeEvent?.name || 'Не указан' }}
              </div>
              <div class="mb-2"><strong>Гос. номер:</strong> {{ selectedMsg.event.car?.number || 'Не указана' }}</div>
              <div class="mb-2"><strong>Модель:</strong> {{ selectedMsg.event.car?.modelCar?.name || '—' }}</div>
              <div class="mb-2"><strong>Дата и время:</strong>
                {{ new Date(selectedMsg.event.dateTime).toLocaleString('ru-RU') }}
              </div>
            </div>
            <div class="col-6">
              <div class="mb-2"><strong>Широта:</strong> {{ displayVal(selectedMsg.event.latitude) }}</div>
              <div class="mb-2"><strong>Долгота:</strong> {{ displayVal(selectedMsg.event.longitude) }}</div>
              <div class="mb-2">
                <strong>Статус:</strong>
                <template v-if="selectedMsg.event.typeEvent?.name !== 'SOS'">
                  <span class="badge bg-secondary ms-1">Не требует реакции</span>
                </template>
                <template v-else>
                  <span v-if="selectedMsg.historys?.some(h => h.answer)" class="badge bg-success ms-1">Отвечено</span>
                  <span v-else class="badge bg-danger ms-1">Нет ответа</span>
                </template>
              </div>
            </div>
          </div>

          <!-- Площадка -->
          <h6 class="fw-bold mb-2">Площадка</h6>
          <div class="row mb-3">
            <div class="col-6">
              <div class="mb-2"><strong>Название:</strong> {{ selectedMsg.event.platforms?.name || '—' }}</div>
            </div>
            <div class="col-6">
              <div class="mb-2"><strong>Адрес:</strong> {{ selectedMsg.event.platforms?.address || '—' }}</div>
            </div>
          </div>

          <!-- Телеметрия -->
          <h6 class="fw-bold mb-2">Телеметрия</h6>
          <div class="row">
            <div class="col-6">
              <div class="mb-2"><strong>Крутящий момент:</strong> {{ displayVal(selectedMsg.event.engineTorque) }}</div>
              <div class="mb-2"><strong>Нагрузка двигателя (%):</strong> {{ displayVal(selectedMsg.event.engineLoad) }}
              </div>
              <div class="mb-2"><strong>Давление масла:</strong> {{ displayVal(selectedMsg.event.engineOilPressure) }}
              </div>
              <div class="mb-2"><strong>Температура масла:</strong> {{
                  displayVal(selectedMsg.event.engineILTemperature)
                }}
              </div>
              <div class="mb-2"><strong>Температура выхлопных газов (EGT):</strong>
                {{ displayVal(selectedMsg.event.exhaustGasTemperature) }}
              </div>
              <div class="mb-2"><strong>Моточасы:</strong> {{ displayInterval(selectedMsg.event.engineOperatingHours) }}
              </div>
              <div class="mb-2"><strong>Температура трансмиссии:</strong>
                {{ displayVal(selectedMsg.event.transmissionTemperature) }}
              </div>
            </div>
            <div class="col-6">
              <div class="mb-2"><strong>Расход топлива (реальн.):</strong>
                {{ displayVal(selectedMsg.event.remainingFuelRealTime) }}
              </div>
              <div class="mb-2"><strong>Остаток топлива (%):</strong> {{ displayVal(selectedMsg.event.remainingFuel) }}
              </div>
              <div class="mb-2"><strong>Давление в гидросистеме:</strong>
                {{ displayVal(selectedMsg.event.pressureHydraulicSystem) }}
              </div>
              <div class="mb-2"><strong>Температура гидр. жидкости:</strong>
                {{ displayVal(selectedMsg.event.hydraulicFluidTemperature) }}
              </div>
              <div class="mb-2"><strong>Напряжение АКБ:</strong> {{ displayVal(selectedMsg.event.batteryVoltage) }}
              </div>
            </div>
          </div>

          <!-- История реакций -->

          <template v-if="selectedMsg.event.typeEvent?.name=='SOS'">
            <br>

            <h6 class="fw-bold mb-2">История реакций</h6>
            <div v-if="selectedMsg.historys?.length" class="mb-3">
              <div
                  v-for="h in selectedMsg.historys"
                  :key="h.id"
                  class="d-flex align-items-start gap-2 mb-2 p-2"
                  style="border-radius: 6px; background-color: #f8f9fa; border-left: 4px solid;"
                  :style="{ borderColor: h.answer ? '#198754' : '#dc3545' }"
              >
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between">
                  <span class="fw-semibold">
                    {{ h.user?.lastname }} {{ h.user?.firstname }} {{ h.user?.surname }}
                  </span>
                    <span class="text-muted small">
                    {{ new Date(h.dataTime).toLocaleString('ru-RU') }}
                  </span>
                  </div>
                  <div class="mt-1">
                  <span :class="h.answer ? 'badge bg-success' : 'badge bg-danger'">
                    {{ h.answer ? 'Принято' : 'Отклонено' }}
                  </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-muted mb-3 small">Реакций пока нет</div>

          </template>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeEventModal">Закрыть</button>
        </div>

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
</style>
