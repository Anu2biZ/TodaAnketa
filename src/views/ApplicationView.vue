<template>
  <div class="min-h-screen relative overflow-hidden">
    <main class="relative mt-10 max-w-[900px] mx-auto px-4 py-8">
      <!-- Logo -->
      <div class="text-center mb-12 flex justify-center">
        <img class="h-[60px]" src="/logo-1.svg" alt="">
      </div>

      <!-- Form Container -->
      <div class="glass-card px-8 py-12 mb-8 relative overflow-hidden">
        <!-- Step Title -->
        <h2 class="font-raleway text-2xl font-bold mb-8 bg-gradient-to-r from-toda-primary via-toda-secondary to-toda-accent inline-block text-transparent bg-clip-text">
          {{ formSteps[currentStep].title }}
        </h2>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-for="question in formSteps[currentStep].questions" :key="question.id" class="space-y-2">
            <label :for="question.id" class="block text-gray-300 font-medium">
              {{ question.label }}
              <span v-if="question.required" class="text-red-500">*</span>
            </label>
            
            <template v-if="question.type === 'input'">
              <input
                :id="question.id"
                v-model="formData[`step${currentStep + 1}`][question.id]"
                type="text"
                class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
              >
            </template>
            
            <template v-else-if="question.type === 'textarea'">
              <textarea
                :id="question.id"
                v-model="formData[`step${currentStep + 1}`][question.id]"
                rows="4"
                class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
              ></textarea>
            </template>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-8 pt-6 border-t border-gray-700">
            <button
              type="button"
              v-if="!isFirstStep"
              @click="previousStep"
              class="px-6 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Back
            </button>
            <div class="ml-auto flex gap-4">
              <button
                type="button"
                v-if="!isLastStep"
                @click="handleNext"
                class="px-6 py-2 bg-gradient-to-r from-toda-primary via-toda-secondary to-toda-accent rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Next
              </button>
              <button
                type="submit"
                v-if="isLastStep"
                class="px-6 py-2 bg-gradient-to-r from-toda-primary via-toda-secondary to-toda-accent rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Steps Indicator -->
      <div class="flex justify-center gap-2 mt-6">
        <div
          v-for="(step, index) in formSteps"
          :key="index"
          :class="[
            'w-3 h-3 rounded-full',
            currentStep === index
              ? 'bg-gradient-to-r from-toda-primary to-toda-accent'
              : 'bg-gray-600'
          ]"
        ></div>
      </div>
    </main>

    <!-- Toast Notification -->
    <ToastNotification
      v-model:show="showToast"
      :message="toastMessage"
      :type="toastType"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useApplicationFormStore } from '../stores/applicationForm'
import ToastNotification from '../components/ToastNotification.vue'

const router = useRouter()
const store = useApplicationFormStore()

// Реактивные значения из store
const { currentStep, formData, isLastStep, isFirstStep } = storeToRefs(store)
// Методы и данные из store
const { nextStep, previousStep, validateStep, validateForm, resetForm, formSteps } = store

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Show toast helper
function showNotification(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Handle next step
function handleNext() {
  if (validateStep(currentStep.value)) {
    nextStep()
  } else {
    showNotification('Please fill in at least one required field', 'error')
  }
}

// Handle form submission
async function handleSubmit() {
  if (!validateForm()) {
    showNotification('Please fill in at least one field in the form', 'error')
    return
  }

  try {
    // Здесь можно добавить отправку данных на сервер
    console.log('Form submitted:', formData.value)
    showNotification('Form submitted successfully!')
    
    // Сброс формы и редирект на главную через 2 секунды
    setTimeout(() => {
      resetForm()
      router.push('/')
    }, 2000)
  } catch (error) {
    showNotification('An error occurred while submitting the form', 'error')
  }
}
</script>
