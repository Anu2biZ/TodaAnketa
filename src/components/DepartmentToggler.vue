<template>
  <div class="space-y-4">
    <div class="flex items-center space-x-4">
      <button 
        type="button"
        @click="toggleDepartment"
        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
        :class="modelValue.enabled ? 'bg-toda-primary' : 'bg-gray-700'"
      >
        <span 
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          :class="modelValue.enabled ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
      <span class="font-medium text-gray-300">{{ departmentName }}</span>
    </div>

    <!-- Поля департамента -->
    <div v-if="modelValue.enabled" class="pl-4 space-y-4 border-l border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- ФИО -->
        <div class="space-y-2">
          <label class="block text-gray-300 text-sm">
            Full name
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="modelValue.fullName"
            type="text"
            class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
          >
        </div>

        <!-- Должность -->
        <div class="space-y-2">
          <label class="block text-gray-300 text-sm">
            Position
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="modelValue.position"
            type="text"
            class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
          >
        </div>

        <!-- Telegram -->
        <div class="space-y-2">
          <label class="block text-gray-300 text-sm">
             Telegram contact
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="modelValue.telegram"
            type="text"
            class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
          >
        </div>

        <!-- Email -->
        <div class="space-y-2">
          <label class="block text-gray-300 text-sm">
            Email
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="modelValue.email"
            type="email"
            class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
            :class="{'border-red-500': !isValidEmail && modelValue.email}"
          >
          <span v-if="!isValidEmail && modelValue.email" class="text-red-500 text-sm">
            Please enter valid email
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  departmentName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const isValidEmail = computed(() => {
  if (!props.modelValue.email) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(props.modelValue.email)
})

function toggleDepartment() {
  emit('update:modelValue', {
    ...props.modelValue,
    enabled: !props.modelValue.enabled
  })
}
</script>
