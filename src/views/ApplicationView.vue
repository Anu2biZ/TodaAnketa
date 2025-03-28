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
import { useSalesManagersStore } from '../stores/salesManagers'
import ToastNotification from '../components/ToastNotification.vue'

const router = useRouter()
const store = useApplicationFormStore()
const salesStore = useSalesManagersStore()

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
    // Подготавливаем данные для отправки
    const flatData = {
      website: formData.value.step1.website,
      contact: formData.value.step1.contact,
      brief: formData.value.step1.brief,
      license: formData.value.step1.license,
      project_exist: formData.value.step1.projectExist,
      geo: formData.value.step2.geo,
      volume_1m: formData.value.step2.volume1m,
      volume_2m: formData.value.step2.volume2m,
      volume_3m: formData.value.step2.volume3m,
      currency: formData.value.step2.currency,
      avg_transaction: formData.value.step2.avgTransaction,
      chargeback_rate: formData.value.step2.chargebackRate,
      refund_rate: formData.value.step2.refundRate,
      processing_history: formData.value.step3.processingHistory,
      traffic_type: formData.value.step3.trafficType,
      card_payouts: formData.value.step3.cardPayouts,
      integration_platform: formData.value.step3.integrationPlatform,
      sale_name: salesStore.currentSaleName || 'No sale ID',
    }

    // ВАЖНО: Используем URLSearchParams для отправки данных как form-data
    // Это более надежно при работе с Apps Script
    const formBody = new URLSearchParams();
    for (const key in flatData) {
      formBody.append(key, flatData[key] || '');
    }

    // Для отладки - запускаем индикатор загрузки
    const isLoading = ref(true);
    
    // Отправляем данные в Google Sheets через Apps Script
    const response = await fetch('https://script.google.com/macros/s/AKfycbzCaDCFxpkmEkJYKOvF_xrGa4ZB-MCmsSzfPftcu06P2QOB74neo27KVGkzpRcdU0g8/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody
    })
    
    isLoading.value = false;
    
    if (response.ok) {
      showNotification('Form submitted successfully!')
      
      // Сброс формы и редирект на главную через 2 секунды
      setTimeout(() => {
        resetForm()
        router.push('/')
      }, 2000)
    } else {
      // Если ответ не ok, показываем ошибку
      const responseText = await response.text();
      console.error('Server error:', responseText);
      showNotification('Server error: ' + (responseText || response.statusText), 'error');
    }
  } catch (error) {
    console.error('Submission error:', error)
    showNotification('An error occurred while submitting the form', 'error')
  }
}
</script>
