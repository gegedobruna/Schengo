<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Country -->
      <div>
        <label class="label">Country</label>
        <select 
          v-model="form.country" 
          class="input"
          :class="{ 'input-error': errors.country }"
          :disabled="disabled"
        >
          <option value="">Select a country</option>
          <option v-for="country in schengenCountries" :key="country.code" :value="country.code">
            {{ country.name }}
          </option>
        </select>
        <p v-if="errors.country" class="error-message">{{ errors.country }}</p>
      </div>

      <!-- Duration (calculated automatically) -->
      <div>
        <label class="label">Duration</label>
        <div class="input bg-gray-50" :class="{ 'input-error': errors.duration }">
          {{ calculatedDuration }} days
        </div>
        <p v-if="errors.duration" class="error-message">{{ errors.duration }}</p>
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Entry Date -->
      <div>
        <label class="label">Entry Date</label>
        <input 
          type="date" 
          v-model="entryDateString"
          class="input"
          :class="{ 'input-error': errors.entryDate }"
          :disabled="disabled"
        />
        <p v-if="errors.entryDate" class="error-message">{{ errors.entryDate }}</p>
      </div>

      <!-- Exit Date -->
      <div>
        <label class="label">Exit Date</label>
        <input 
          type="date" 
          v-model="exitDateString"
          class="input"
          :class="{ 'input-error': errors.exitDate }"
          :disabled="disabled"
        />
        <p v-if="errors.exitDate" class="error-message">{{ errors.exitDate }}</p>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="flex justify-end space-x-4">
      <button 
        type="button" 
        @click="handleReset"
        class="btn btn-secondary"
        :disabled="disabled"
      >
        Reset
      </button>
      <button 
        type="submit" 
        class="btn btn-primary"
        :disabled="disabled || !isFormValid"
      >
        {{ isEditing ? 'Update Stay' : 'Add Stay' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { DateTime } from 'luxon'
import { z } from 'zod'
import type { Stay } from '../types'

interface Props {
  stay?: Stay
  disabled?: boolean
}

interface Emits {
  (e: 'save', stay: Omit<Stay, 'id'>): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<Emits>()

// Form state
const form = ref({
  country: props.stay?.country || '',
  entryDate: props.stay?.entryDate || DateTime.now(),
  exitDate: props.stay?.exitDate || DateTime.now().plus({ days: 1 })
})

const errors = ref<Record<string, string>>({})

// Computed properties
const entryDateString = computed({
  get: () => form.value.entryDate.toISODate() || '',
  set: (value: string) => {
    if (value) {
      form.value.entryDate = DateTime.fromISO(value)
    }
  }
})

const exitDateString = computed({
  get: () => form.value.exitDate.toISODate() || '',
  set: (value: string) => {
    if (value) {
      form.value.exitDate = DateTime.fromISO(value)
    }
  }
})

const calculatedDuration = computed(() => {
  if (!form.value.entryDate || !form.value.exitDate) return 0
  return form.value.exitDate.diff(form.value.entryDate, 'days').days + 1
})

const isEditing = computed(() => !!props.stay)

const isFormValid = computed(() => {
  return form.value.country && 
         form.value.entryDate && 
         form.value.exitDate && 
         form.value.entryDate < form.value.exitDate &&
         Object.keys(errors.value).length === 0
})

// Schengen countries list
const schengenCountries = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' }
]

// Validation schema
const staySchema = z.object({
  country: z.string().min(1, 'Please select a country'),
  entryDate: z.any().refine(val => val instanceof DateTime, 'Invalid entry date'),
  exitDate: z.any().refine(val => val instanceof DateTime, 'Invalid exit date')
}).refine(data => data.entryDate < data.exitDate, {
  message: 'Entry date must be before exit date',
  path: ['exitDate']
})

// Watch for changes and validate
watch([() => form.value.country, () => form.value.entryDate, () => form.value.exitDate], () => {
  validateForm()
}, { deep: true })

// Methods
const validateForm = () => {
  try {
    staySchema.parse(form.value)
    errors.value = {}
  } catch (error) {
    if (error instanceof z.ZodError) {
      const newErrors: Record<string, string> = {}
      error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message
        }
      })
      errors.value = newErrors
    }
  }
}

const handleSubmit = () => {
  validateForm()
  if (isFormValid.value) {
    const stay: Omit<Stay, 'id'> = {
      country: form.value.country,
      entryDate: form.value.entryDate,
      exitDate: form.value.exitDate,
      duration: calculatedDuration.value
    }
    emit('save', stay)
  }
}

const handleReset = () => {
  form.value = {
    country: '',
    entryDate: DateTime.now(),
    exitDate: DateTime.now().plus({ days: 1 })
  }
  errors.value = {}
}
</script>
