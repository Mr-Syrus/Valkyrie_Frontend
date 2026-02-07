
<script setup>
import {reactive, computed, watch, onMounted} from 'vue'
import FiltersPanel from '@/components/FiltersPanel.vue'

const sections = reactive([
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
    { deep: true }
)

async function sendRequest(data) {
  // API call
}


onMounted(async () => {
  await sendRequest(sections)
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
            <div class="col-3 mb-3" v-for="item in items" :key="item.id">
              <div class="position-relative p-3" style="background-color: #D9D9D9; height: 100px;">
                <!-- Левый верхний текст -->
                <div class="text-start">
                  {{ item }}
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
