
<script setup>
import {reactive, computed, watch} from 'vue'
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


// Автоматически собираем q из sections
const q = computed(() => {
  const result = {}
  sections.forEach(section => {
    section.items.forEach(item => {
      if (item.checked) {
        result[item.teg] = item.q
      }
    })
  })
  return result
})
</script>


<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Левая панель -->
      <FiltersPanel :sections="sections" />

      <!-- Правая часть -->
      <div class="col p-3">
        <h4>Правая часть</h4>
        <p>Здесь будет основной контент.</p>

        <!-- Отладка: что реально уходит -->
        <pre>{{ q }}</pre>
      </div>
    </div>
  </div>
</template>
