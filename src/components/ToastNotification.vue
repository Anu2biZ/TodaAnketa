<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-2 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-2 opacity-0"
  >
    <div
      v-if="show"
      :class="[
        'fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50',
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
      ]"
    >
      <p class="text-white">{{ message }}</p>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success'
  }
})

defineEmits(['update:show'])
</script>
