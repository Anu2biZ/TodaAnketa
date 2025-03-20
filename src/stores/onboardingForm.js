import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOnboardingFormStore = defineStore('onboardingForm', () => {
  const currentStep = ref(0)
  const formData = ref({
    step1: {
      projectName: 'test name',
      telegramGroup: 'test tg',
      departments: {
        compliance: {
          enabled: true,
          fullName: 'test name',
          position: 'test position',
          telegram: 'test tg',
          email: 'testemail@ya.ru'
        },
        legal: {
          enabled: false,
          fullName: '',
          position: '',
          telegram: '',
          email: ''
        },
        chargeback: {
          enabled: false,
          fullName: '',
          position: '',
          telegram: '',
          email: ''
        },
        finance: {
          enabled: false,
          fullName: '',
          position: '',
          telegram: '',
          email: ''
        },
        technical: {
          enabled: false,
          fullName: '',
          position: '',
          telegram: '',
          email: ''
        }
      },
      comments: ''
    },
    step2: {
      companyName: 'company name',
      legalAddress: 'legal address',
      registrationDate: '12.12.2024',
      registrationNumber: 'reg no',
      licenseJurisdiction: 'licenseJurisdiction',
      licenseNumber: 'licenseNumber',
      projectNature: 'PSP',
      projectNatureOther: '',
      industries: 'hz',
      notBelongToCategory: false,
      website: 'https://vk.com'
    },
    step3: {
      uboCountryCitizenship: '1',
      uboCountryResidence: '2',
      directorCountryCitizenship: '3',
      directorCountryResidence: '4',
      shareholderCountryCitizenship: '5',
      shareholderCountryResidence: '6'
    },
    step4: {
      urls: '2',
      processingHistory: {
        hasHistory: true,
        file: []
      },
      chargebackStatistics: {
        hasStatistics: true,
        file: []
      }
    },
    step5: {
      documents: {
        incorporation: {
          files: [],
          comment: '',
          noDocument: false
        },
        incumbency: {
          files: [],
          comment: '',
          noDocument: false
        },
        articles: {
          files: [],
          comment: '',
          noDocument: false
        },
        ownershipChart: {
          files: [],
          comment: '',
          noDocument: false
        },
        boardOfDirectors: {
          files: [],
          comment: '',
          noDocument: false
        },
        shareholderRegister: {
          files: [],
          comment: '',
          noDocument: false
        },
        operatingLicense: {
          files: [],
          comment: '',
          noDocument: false
        },
        amlPolicy: {
          files: [],
          comment: '',
          noDocument: false
        },
        mlroInformation: {
          files: [],
          comment: '',
          noDocument: false
        },
        kycDocuments: {
          files: [],
          comment: '',
          noDocument: false
        },
        legalEntityDocuments: {
          files: [],
          comment: '',
          noDocument: false
        }
      }
    }
  })

  const formSteps = [
    {
      title: 'Contact Information',
      validate: (data) => {
        const step = data.step1
        if (!step.projectName || !step.telegramGroup) return false
        
        // Проверяем, что для каждого включенного департамента заполнены все поля
        for (const dept of Object.values(step.departments)) {
          if (dept.enabled) {
            if (!dept.fullName || !dept.position || !dept.telegram || !dept.email) return false
            // Валидация email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(dept.email)) return false
          }
        }
        return true
      }
    },
    {
      title: 'Company Information',
      validate: (data) => {
        const step = data.step2
        
        // Проверяем обязательные поля
        if (!step.companyName || !step.legalAddress || !step.registrationDate || 
            !step.registrationNumber || !step.projectNature) {
          return false
        }
        
        // Проверка даты регистрации
        const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/
        if (!dateRegex.test(step.registrationDate)) {
          return false
        }
        
        // Проверка корректности даты
        const [day, month, year] = step.registrationDate.split('.')
        const date = new Date(year, month - 1, day)
        if (date.getDate() !== parseInt(day) || 
            (date.getMonth() + 1) !== parseInt(month) || 
            date.getFullYear() !== parseInt(year)) {
          return false
        }

        // Если выбран "Others", должно быть заполнено дополнительное поле
        if (step.projectNature === 'Others' && !step.projectNatureOther) {
          return false
        }

        // Валидация URL сайта (только если URL указан и не пустой)
        const websiteValue = step.website.trim()
        if (websiteValue !== '') {
          try {
            new URL(websiteValue)
          } catch {
            return false
          }
        }

        // Проверяем, что все обязательные поля заполнены
        return step.companyName.trim() !== '' && 
               step.legalAddress.trim() !== '' && 
               step.registrationNumber.trim() !== '' && 
               step.projectNature !== ''
      }
    },
    {
      title: 'UBO and Corporate Structure',
      validate: (data) => {
        const step = data.step3
        return step.uboCountryCitizenship && step.uboCountryResidence &&
               step.directorCountryCitizenship && step.directorCountryResidence &&
               step.shareholderCountryCitizenship && step.shareholderCountryResidence
      }
    },
    {
      title: 'URLs and Processing History',
      validate: (data) => {
        const step = data.step4
        if (!step.urls) return false
        
        // Проверяем, что либо выбрано NO, либо есть хотя бы один файл
        if (!step.processingHistory.hasHistory && !step.processingHistory.file?.length) return false
        if (!step.chargebackStatistics.hasStatistics && !step.chargebackStatistics.file?.length) return false
        
        return true
      }
    },
    {
      title: 'Documents',
      validate: (data) => {
        const docs = data.step5.documents
        // Проверяем каждый документ - должен быть либо загружен файл, либо отмечено NO
        for (const doc of Object.values(docs)) {
          if (!doc.noDocument && doc.files.length === 0) return false
        }
        return true
      }
    }
  ]

  const isFirstStep = computed(() => currentStep.value === 0)
  const isLastStep = computed(() => currentStep.value === formSteps.length - 1)

  function nextStep() {
    if (currentStep.value < formSteps.length - 1) {
      currentStep.value++
    }
  }

  function previousStep() {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  function validateStep(step) {
    return formSteps[step].validate(formData.value)
  }

  function validateForm() {
    return formSteps.every((_, index) => validateStep(index))
  }

  function resetForm() {
    currentStep.value = 0
    formData.value = {
      step1: {
        projectName: '',
        telegramGroup: '',
        departments: {
          compliance: { enabled: false, fullName: '', position: '', telegram: '', email: '' },
          legal: { enabled: false, fullName: '', position: '', telegram: '', email: '' },
          chargeback: { enabled: false, fullName: '', position: '', telegram: '', email: '' },
          finance: { enabled: false, fullName: '', position: '', telegram: '', email: '' },
          technical: { enabled: false, fullName: '', position: '', telegram: '', email: '' }
        },
        comments: ''
      },
      step2: {
        companyName: '',
        legalAddress: '',
        registrationDate: '',
        registrationNumber: '',
        licenseJurisdiction: '',
        licenseNumber: '',
        projectNature: '',
        projectNatureOther: '',
        industries: '',
        notBelongToCategory: false,
        website: ''
      },
      step3: {
        uboCountryCitizenship: '',
        uboCountryResidence: '',
        directorCountryCitizenship: '',
        directorCountryResidence: '',
        shareholderCountryCitizenship: '',
        shareholderCountryResidence: ''
      },
      step4: {
        urls: '',
        processingHistory: { hasHistory: false, file: [] },
        chargebackStatistics: { hasStatistics: false, file: [] }
      },
      step5: {
        documents: {
          incorporation: { files: [], comment: '', noDocument: false },
          incumbency: { files: [], comment: '', noDocument: false },
          articles: { files: [], comment: '', noDocument: false },
          ownershipChart: { files: [], comment: '', noDocument: false },
          boardOfDirectors: { files: [], comment: '', noDocument: false },
          shareholderRegister: { files: [], comment: '', noDocument: false },
          operatingLicense: { files: [], comment: '', noDocument: false },
          amlPolicy: { files: [], comment: '', noDocument: false },
          mlroInformation: { files: [], comment: '', noDocument: false },
          kycDocuments: { files: [], comment: '', noDocument: false },
          legalEntityDocuments: { files: [], comment: '', noDocument: false }
        }
      }
    }
  }

  return {
    currentStep,
    formData,
    isFirstStep,
    isLastStep,
    nextStep,
    previousStep,
    validateStep,
    validateForm,
    resetForm,
    formSteps: formSteps // Добавляем formSteps в возвращаемый объект
  }
})
