<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- Upload Progress Overlay -->
    <div v-if="isUploading" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-gray-900 p-8 rounded-lg shadow-xl max-w-lg w-full mx-4">
        <h3 class="text-xl font-semibold mb-4 text-white">Загрузка файлов</h3>
        
        <!-- Overall Progress -->
        <div class="mb-6">
          <div class="flex justify-between mb-2">
            <span class="text-gray-300">Общий прогресс</span>
            <span class="text-gray-300">{{ uploadProgress.totalFiles - uploadProgress.remainingFiles }}/{{ uploadProgress.totalFiles }}</span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-2.5">
            <div class="bg-toda-primary h-2.5 rounded-full" 
                 :style="{ width: `${((uploadProgress.totalFiles - uploadProgress.remainingFiles) / uploadProgress.totalFiles) * 100}%` }">
            </div>
          </div>
        </div>

        <!-- Current File Progress -->
        <div v-if="uploadProgress.currentFile" class="mb-6">
          <div class="flex justify-between mb-2">
            <span class="text-gray-300">{{ uploadProgress.currentFile.name }}</span>
            <span class="text-gray-300">{{ uploadProgress.currentFile.progress }}%</span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-2.5">
            <div class="bg-toda-secondary h-2.5 rounded-full" 
                 :style="{ width: `${uploadProgress.currentFile.progress}%` }">
            </div>
          </div>
        </div>

        <!-- Status Messages -->
        <div class="text-sm text-gray-400 space-y-1">
          <div v-for="(message, index) in uploadProgress.messages" :key="index">
            {{ message }}
          </div>
        </div>

        <p class="mt-4 text-sm text-gray-400">
          Пожалуйста, не закрывайте страницу до завершения загрузки
        </p>
      </div>
    </div>
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
          <!-- Step 1: Contact Information -->
          <template v-if="currentStep === 0">
            <div class="space-y-6">
              <!-- Project Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    Project Name
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.step1.projectName"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    Telegram Group Name
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.step1.telegramGroup"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
              </div>

              <!-- Departments -->
              <div class="space-y-6">
                <h3 class="text-lg font-medium text-gray-300">Departments</h3>
                <DepartmentToggler
                  v-model="formData.step1.departments.compliance"
                  department-name="Compliance"
                />
                <DepartmentToggler
                  v-model="formData.step1.departments.legal"
                  department-name="Legal"
                />
                <DepartmentToggler
                  v-model="formData.step1.departments.chargeback"
                  department-name="Chargeback Department"
                />
                <DepartmentToggler
                  v-model="formData.step1.departments.finance"
                  department-name="Finance Department"
                />
                <DepartmentToggler
                  v-model="formData.step1.departments.technical"
                  department-name="Technical Department"
                />
              </div>

              <!-- Comments -->
              <div class="space-y-2">
                <label class="block text-gray-300">Comments</label>
                <textarea
                  v-model="formData.step1.comments"
                  rows="4"
                  class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                ></textarea>
              </div>
            </div>
          </template>

          <!-- Step 2: Company Info -->
          <template v-if="currentStep === 1">
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    Name of your company
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.step2.companyName"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    Legal address of your company
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.step2.legalAddress"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    Date of registration
                    <span class="text-red-500">*</span>
                  </label>
                  <div>
                    <input
                      v-model="formData.step2.registrationDate"
                      type="text"
                      placeholder="DD.MM.YYYY"
                      class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                      :class="{'border-red-500': !isValidDate && formData.step2.registrationDate}"
                    >
                    <span v-if="!isValidDate && formData.step2.registrationDate" class="text-red-500 text-sm mt-1 block">
                      Please enter a valid date in DD.MM.YYYY format
                    </span>
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    Registration number
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.step2.registrationNumber"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    License jurisdiction (if applicable)
                  </label>
                  <input
                    v-model="formData.step2.licenseJurisdiction"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    License number (if applicable)
                  </label>
                  <input
                    v-model="formData.step2.licenseNumber"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
              </div>

              <div class="space-y-6">
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    Nature of your project
                    <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="formData.step2.projectNature"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                    <option value="">Select nature</option>
                    <option value="Gambling">Gambling</option>
                    <option value="Betting">Betting</option>
                    <option value="PSP">PSP</option>
                    <option value="Payment System">Payment System (Agregator)</option>
                    <option value="Agent">Agent (Affiliate)</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div v-if="formData.step2.projectNature === 'Others'" class="space-y-2">
                  <label class="block text-gray-300">
                    Specify other nature
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.step2.projectNatureOther"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>

                <div class="space-y-2">
                  <label class="block text-gray-300">
                    What industries do you work with
                  </label>
                  <input
                    v-model="formData.step2.industries"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>

                <div class="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="notBelongToCategory"
                    v-model="formData.step2.notBelongToCategory"
                    class="h-4 w-4 rounded border-gray-700 bg-gray-800 text-toda-primary focus:ring-toda-primary"
                  >
                  <label for="notBelongToCategory" class="text-gray-300">
                    My project does not belong to this category
                  </label>
                </div>

                <div class="space-y-2">
                  <label class="block text-gray-300">
                    Your company's website
                  </label>
                  <input
                    v-model="formData.step2.website"
                    type="url"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
              </div>
            </div>
          </template>

          <!-- Step 3: UBO and Corporate Structure -->
          <template v-if="currentStep === 2">
            <div class="space-y-6">
              <div class="grid grid-cols-1  gap-6">
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    What is the country of citizenship of your UBO
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.step3.uboCountryCitizenship"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    What is the country of residence of your UBO
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.step3.uboCountryResidence"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    What is the country of citizenship/registration of your Director
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.step3.directorCountryCitizenship"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    What is the country of residence of your Director
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.step3.directorCountryResidence"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    What is the country of citizenship/registration of your Shareholder(s)
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.step3.shareholderCountryCitizenship"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-gray-300">
                    What is the country of residence of your Shareholder(s)
                    <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.step3.shareholderCountryResidence"
                    type="text"
                    class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                  >
                </div>
              </div>
            </div>
          </template>

          <!-- Step 4: URLs and Processing History -->
          <template v-if="currentStep === 3">
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="block text-gray-300">
                  List of the URLs you want to onboard with us
                  <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="formData.step4.urls"
                  rows="4"
                  class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-toda-primary"
                ></textarea>
              </div>

              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-300">Processing history for 6 month</h3>
                <div class="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="noProcessingHistory"
                    v-model="formData.step4.processingHistory.hasHistory"
                    class="h-4 w-4 rounded border-gray-700 bg-gray-800 text-toda-primary focus:ring-toda-primary"
                  >
                  <label for="noProcessingHistory" class="text-gray-300">NO</label>
                </div>
                <FileUploader
                  v-if="!formData.step4.processingHistory.hasHistory"
                  v-model="formData.step4.processingHistory.file"
                  id="processingHistory"
                  :multiple="true"
                  :show-no-option="false"
                />
              </div>

              <div class="space-y-4">
                <h3 class="text-lg font-medium text-gray-300">Chargeback statistics for 6 month</h3>
                <div class="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="noChargebackStats"
                    v-model="formData.step4.chargebackStatistics.hasStatistics"
                    class="h-4 w-4 rounded border-gray-700 bg-gray-800 text-toda-primary focus:ring-toda-primary"
                  >
                  <label for="noChargebackStats" class="text-gray-300">NO</label>
                </div>
                <FileUploader
                  v-if="!formData.step4.chargebackStatistics.hasStatistics"
                  v-model="formData.step4.chargebackStatistics.file"
                  id="chargebackStats"
                  :multiple="true"
                  :show-no-option="false"
                />
              </div>
            </div>
          </template>

          <!-- Step 5: Documents -->
          <template v-if="currentStep === 4">
            <div class="space-y-8">
              <div v-for="(doc, key) in formData.step5.documents" :key="key" class="space-y-4">
                <h3 class="text-lg font-medium text-gray-300">{{ getDocumentTitle(key) }}</h3>
                <FileUploader
                  v-model="doc.files"
                  :id="key"
                  :show-no-option="true"
                  v-model:no-document="doc.noDocument"
                  :show-comment="true"
                  v-model:comment="doc.comment"
                  :multiple="true"
                />
              </div>
            </div>
          </template>

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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOnboardingFormStore } from '../stores/onboardingForm'
import { useSalesManagersStore } from '../stores/salesManagers'
import ToastNotification from '../components/ToastNotification.vue'
import DepartmentToggler from '../components/DepartmentToggler.vue'
import FileUploader from '../components/FileUploader.vue'

const router = useRouter()
const store = useOnboardingFormStore()
const salesStore = useSalesManagersStore()

// Upload state
const isUploading = ref(false)
const uploadProgress = ref({
  totalFiles: 0,
  remainingFiles: 0,
  currentFile: null,
  messages: []
})

// Helper to add progress message
function addProgressMessage(message) {
  uploadProgress.value.messages.unshift(`${new Date().toLocaleTimeString()}: ${message}`)
  // Keep only last 5 messages
  if (uploadProgress.value.messages.length > 5) {
    uploadProgress.value.messages.pop()
  }
}

// Reactive values from store
const { currentStep, formData, isLastStep, isFirstStep } = storeToRefs(store)
// Methods and data from store
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

// Date validation
const isValidDate = computed(() => {
  const date = formData.value.step2.registrationDate
  if (!date) return true

  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/
  if (!dateRegex.test(date)) return false

  const [day, month, year] = date.split('.')
  const dateObj = new Date(year, month - 1, day)
  return dateObj.getDate() === parseInt(day) && 
         (dateObj.getMonth() + 1) === parseInt(month) && 
         dateObj.getFullYear() === parseInt(year)
})

// Handle next step
function handleNext() {
  if (validateStep(currentStep.value)) {
    nextStep()
  } else {
    let errorMessage = 'Please fill in all required fields'
    
    // Specific messages for each step
    if (currentStep.value === 0) {
      if (!formData.value.step1.projectName || !formData.value.step1.telegramGroup) {
        errorMessage = 'Please fill in project name and Telegram group name'
      } else {
        // Check departments
        for (const [name, dept] of Object.entries(formData.value.step1.departments)) {
          if (dept.enabled && (!dept.fullName || !dept.position || !dept.telegram || !dept.email)) {
            errorMessage = `Please fill in all fields for ${name} department`
            break
          }
          if (dept.enabled && !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(dept.email)) {
            errorMessage = `Please enter a valid email for ${name} department`
            break
          }
        }
      }
    } else if (currentStep.value === 1) {
      const step2 = formData.value.step2
      if (!step2.companyName || !step2.legalAddress || !step2.registrationNumber || !step2.projectNature) {
        errorMessage = 'Please fill in all required company fields'
      } else if (!isValidDate.value) {
        errorMessage = 'Please enter a valid registration date in DD.MM.YYYY format'
      } else if (step2.projectNature === 'Others' && !step2.projectNatureOther) {
        errorMessage = 'Please specify project type'
      } else if (step2.website && !isValidUrl(step2.website)) {
        errorMessage = 'Please enter a valid website URL'
      }
    } else if (currentStep.value === 2) {
      errorMessage = 'Please fill in all fields for UBO, Director and Shareholder'
    } else if (currentStep.value === 3) {
      if (!formData.value.step4.urls) {
        errorMessage = 'Please specify URLs'
      } else {
        errorMessage = 'Please upload history files or mark NO'
      }
    } else if (currentStep.value === 4) {
      errorMessage = 'Please upload all required documents or mark NO'
    }
    
    showNotification(errorMessage, 'error')
  }
}

// URL validation helper
function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Get document title helper
function getDocumentTitle(key) {
  const titles = {
    incorporation: 'Certificate of Incorporation',
    incumbency: 'Certificate of Incumbency/Recent extract from the registry',
    articles: 'Articles & Memorandum of Association',
    ownershipChart: 'Ownership chart signed and dated',
    boardOfDirectors: 'Board of Directors (document that declares Directors)',
    shareholderRegister: 'Shareholder Register',
    operatingLicense: 'Operating License (if applicable)',
    amlPolicy: 'A copy of the company AML Policy',
    mlroInformation: 'MLRO information',
    kycDocuments: 'KYC of Shareholder & Directors & UBO',
    legalEntityDocuments: 'The same package of documents if Shareholder & Directors & UBO is a legal entity'
  }
  return titles[key] || key
}

// Handle form submission
async function handleSubmit() {
  if (!validateForm()) {
    showNotification('Пожалуйста, заполните все обязательные поля', 'error')
    return
  }

  // Показываем оверлей загрузки
  isUploading.value = true;
  
  try {
    // Подготавливаем данные департаментов
    const departmentData = {}
    for (const [name, dept] of Object.entries(formData.value.step1.departments)) {
      if (dept.enabled) {
        departmentData[`${name}_full_name`] = dept.fullName
        departmentData[`${name}_position`] = dept.position
        departmentData[`${name}_telegram`] = dept.telegram
        departmentData[`${name}_email`] = dept.email
      } else {
        departmentData[`${name}_full_name`] = 'NO'
        departmentData[`${name}_position`] = 'NO'
        departmentData[`${name}_telegram`] = 'NO'
        departmentData[`${name}_email`] = 'NO'
      }
    }

    // Подготавливаем данные для отправки
    const flatData = {
      sale_name: salesStore.currentSaleName || 'No sale ID',
      project_name: formData.value.step1.projectName,
      telegram_group: formData.value.step1.telegramGroup,
      ...departmentData,
      comments: formData.value.step1.comments || 'NO',
      company_name: formData.value.step2.companyName,
      legal_address: formData.value.step2.legalAddress,
      registration_date: formData.value.step2.registrationDate,
      registration_number: formData.value.step2.registrationNumber,
      license_jurisdiction: formData.value.step2.licenseJurisdiction || 'NO',
      license_number: formData.value.step2.licenseNumber || 'NO',
      project_nature: formData.value.step2.projectNature === 'Others' 
        ? formData.value.step2.projectNatureOther 
        : formData.value.step2.projectNature,
      industries: formData.value.step2.industries || 'NO',
      not_belongs_to_psp: formData.value.step2.notBelongToCategory,
      website: formData.value.step2.website || 'NO',
      ubo_country_citizenship: formData.value.step3.uboCountryCitizenship,
      ubo_country_residence: formData.value.step3.uboCountryResidence,
      director_country_citizenship: formData.value.step3.directorCountryCitizenship,
      director_country_residence: formData.value.step3.directorCountryResidence,
      shareholder_country_citizenship: formData.value.step3.shareholderCountryCitizenship,
      shareholder_country_residence: formData.value.step3.shareholderCountryResidence,
      urls: formData.value.step4.urls,
      processing_history: formData.value.step4.processingHistory.hasHistory ? 'NO' : 'UPLOADING',
      chargeback_statistics: formData.value.step4.chargebackStatistics.hasStatistics ? 'NO' : 'UPLOADING',
      form_type: 'onboarding' // Маркер для Apps Script
    }

    // Добавляем статусы документов
    for (const [key, doc] of Object.entries(formData.value.step5.documents)) {
      flatData[key] = doc.noDocument ? 'NO' : 'UPLOADING'
    }

    // Создаем FormData для отправки
    const formBody = new URLSearchParams()
    for (const [key, value] of Object.entries(flatData)) {
      formBody.append(key, value.toString())
    }

    // Отправляем данные в Google Sheets
    const response = await fetch(import.meta.env.VITE_GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody
    })

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const result = await response.json()
    
    // Собираем все файлы для загрузки
    const filesToUpload = [];

    // Добавляем файлы истории
    if (!formData.value.step4.processingHistory.hasHistory && formData.value.step4.processingHistory.file.length > 0) {
      formData.value.step4.processingHistory.file.forEach((file, index) => {
        filesToUpload.push({
          file,
          type: 'PROCESSING_HISTORY',
          index: index + 1
        });
      });
    }

    // Добавляем файлы статистики
    if (!formData.value.step4.chargebackStatistics.hasStatistics && formData.value.step4.chargebackStatistics.file.length > 0) {
      formData.value.step4.chargebackStatistics.file.forEach((file, index) => {
        filesToUpload.push({
          file,
          type: 'CHARGEBACK_STATISTICS',
          index: index + 1
        });
      });
    }

    // Добавляем документы
    for (const [key, doc] of Object.entries(formData.value.step5.documents)) {
      if (!doc.noDocument && doc.files.length > 0) {
        doc.files.forEach((file, index) => {
          filesToUpload.push({
            file,
            type: key.toUpperCase(),
            index: index + 1
          });
        });
      }
    }

    // Инициализируем состояние прогресса
    uploadProgress.value = {
      totalFiles: filesToUpload.length,
      remainingFiles: filesToUpload.length,
      currentFile: null,
      messages: []
    };

    addProgressMessage('Начинаем загрузку файлов...');

    // Загружаем файлы последовательно
    for (const fileInfo of filesToUpload) {
      uploadProgress.value.currentFile = {
        name: fileInfo.file.name,
        progress: 0
      };
      addProgressMessage(`Загрузка файла: ${fileInfo.file.name}`);

      try {
        await uploadFileToDrive(fileInfo.file, fileInfo.type, fileInfo.index, result.folderId);
        uploadProgress.value.remainingFiles--;
        addProgressMessage(`✓ Файл ${fileInfo.file.name} успешно загружен`);
      } catch (error) {
        addProgressMessage(`❌ Ошибка загрузки файла ${fileInfo.file.name}: ${error.message}`);
        throw error;
      }
    }

    isUploading.value = false;

    showNotification('Форма успешно отправлена!')
    
    // Сброс формы и редирект на главную через 2 секунды
    setTimeout(() => {
      resetForm()
      router.push('/')
    }, 2000)
  } catch (error) {
    console.error('Ошибка отправки:', error)
    showNotification('Произошла ошибка при отправке формы: ' + error.message, 'error')
    isUploading.value = false
  }
}

// Функция для разбиения файла на чанки
function* getFileChunks(file, chunkSize = 4 * 1024 * 1024) { // 2MB chunks
  const fileSize = file.size
  let offset = 0
  
  while (offset < fileSize) {
    const chunk = file.slice(offset, offset + chunkSize)
    offset += chunkSize
    yield chunk
  }
}

// Функция для загрузки файла в Google Drive
async function uploadFileToDrive(file, type, index, folderId) {
  try {
    console.log('Загрузка файла:', {
      name: file.name,
      type: file.type,
      size: file.size,
      hasFile: !!file.file,
      isBlob: file.file instanceof Blob
    })

    if (!file.file || !(file.file instanceof Blob)) {
      throw new Error('Некорректный формат файла')
    }

    // Получаем чанки файла
    const chunks = Array.from(getFileChunks(file.file))
    console.log(`Файл разбит на ${chunks.length} чанков`)

    // Загружаем чанки последовательно
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      
      // Конвертируем чанк в base64
      const base64Chunk = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = (error) => {
          console.error('Ошибка чтения чанка:', error)
          reject(error)
        }
        reader.readAsDataURL(chunk)
      })

      console.log(`Чанк ${i + 1}/${chunks.length} конвертирован в base64`)

      // Добавляем задержку между загрузками чанков
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const formData = new URLSearchParams()
      formData.append('form_type', 'file_upload')
      formData.append('file', base64Chunk)
      formData.append('type', type)
      formData.append('index', index)
      formData.append('chunk_index', i)
      formData.append('total_chunks', chunks.length)
      formData.append('folderId', folderId)
      formData.append('filename', file.file.name)
      formData.append('contentType', file.file.type)
      formData.append('project_name', store.formData.step1.projectName)

      const response = await fetch(import.meta.env.VITE_GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Ошибка загрузки чанка ${i + 1} файла ${file.name}`)
      }

      const result = await response.json()
      console.log(`Чанк ${i + 1}/${chunks.length} успешно загружен`)
      
      // Обновляем прогресс текущего файла
      uploadProgress.value.currentFile.progress = Math.round(((i + 1) / chunks.length) * 100)

      // Если это последний чанк, возвращаем результат
      if (i === chunks.length - 1) {
        return result
      }
    }
  } catch (error) {
    console.error(`Ошибка загрузки файла ${file.name}:`, error)
    throw error
  }
}
</script>
