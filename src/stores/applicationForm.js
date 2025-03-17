import {defineStore} from 'pinia'
import {ref, computed} from 'vue'

export const useApplicationFormStore = defineStore('applicationForm', () => {
    const currentStep = ref(0)
    const formData = ref({
        step1: {
            website: '',
            contact: '',
            brief: '',
            projectExist: '',
            license: '',
        },
        step2: {
            geo: '',
            volume1m: '',
            volume2m: '',
            volume3m: '',
            currency: '',
            avgTransaction: '',
            chargebackRate: '',
            refundRate: '',
        },
        step3: {
            processingHistory: '',
            trafficType: '',
            cardPayouts: '',
            integrationPlatform: ''
        }
    })

    const formSteps = [
        {
            title: 'Project Information',
            questions: [
                {
                    id: 'website',
                    label: 'Link to the site to which the solution is being integrated',
                    type: 'input',
                    required: true
                },
                {
                    id: 'contact',
                    label: 'Contact person (Full name, Telegram username in @_ format)',
                    type: 'input',
                    required: true
                },
                {
                    id: 'brief',
                    label: 'Brief description of the project (Gambling / Betting / Crypto / Forex, etc.)',
                    type: 'textarea',
                    required: true
                },
                {id: 'license', label: 'What is your license?', type: 'input', required: true},
                {id: 'projectExist', label: 'How long has the project existed?', type: 'input', required: true},
            ]
        },
        {
            title: 'Financial Information',
            questions: [
                {
                    id: 'geo',
                    label: 'List of countries (GEO) with which cooperation is planned (in case of working with several GEOs - specify% of traffic for each GEO)',
                    type: 'textarea',
                    required: true
                },
                {
                    id: 'volume1m',
                    label: 'Planned turnover (volume) of funds in the first month',
                    type: 'input',
                    required: true
                },
                {
                    id: 'volume2m',
                    label: 'Planned turnover (volume) of funds in the second month',
                    type: 'input',
                    required: true
                },
                {
                    id: 'volume3m',
                    label: 'Planned turnover (volume) of funds in the third month',
                    type: 'input',
                    required: true
                },
                {
                    id: 'currency',
                    label: 'List of desired currencies for work (EUR, USD, UAH, etc.)',
                    type: 'input',
                    required: true
                },
                {
                    id: 'avgTransaction',
                    label: 'Average transaction amount (in the currency used)',
                    type: 'input',
                    required: true
                },
                {id: 'chargebackRate', label: 'Expected % chargeback from turnover', type: 'input', required: true},
                {id: 'refundRate', label: 'Expected % refund from turnover', type: 'input', required: true},
            ]
        },
        {
            title: 'Technical Information',
            questions: [
                {id: 'processingHistory', label: 'Is there a processing history?', type: 'textarea', required: true},
                {
                    id: 'trafficType',
                    label: 'What type of traffic do you have (primary (FTD) or secondary (TD)) and percentages',
                    type: 'textarea',
                    required: true
                },
                {id: 'cardPayouts', label: 'Do you need card payouts for your clients?', type: 'input', required: true},
                {
                    id: 'integrationPlatform',
                    label: 'What platform do you use (Corefy, Praxis, Devcode, etc.)?',
                    type: 'input',
                    required: true
                },

            ]
        }
    ]

    const isLastStep = computed(() => currentStep.value === formSteps.length - 1)
    const isFirstStep = computed(() => currentStep.value === 0)

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
        const stepQuestions = formSteps[step].questions
        const stepData = formData.value[`step${step + 1}`]

        // Проверяем, есть ли хотя бы одно заполненное обязательное поле
        const requiredQuestions = stepQuestions.filter(q => q.required)
        if (requiredQuestions.length === 0) return true // Если нет обязательных полей, шаг валиден

        return requiredQuestions.some(q =>
            stepData[q.id] && stepData[q.id].trim() !== ''
        )
    }

    function validateForm() {
        let hasAtLeastOneField = false
        for (let i = 0; i < formSteps.length; i++) {
            const stepData = formData.value[`step${i + 1}`]
            if (stepData && Object.values(stepData).some(value => value && value.trim() !== '')) {
                hasAtLeastOneField = true
            }
        }
        return hasAtLeastOneField
    }

    function resetForm() {
        currentStep.value = 0
        formData.value = {
            step1: {
                website: '',
                contact: '',
                geo: '',
                volume1m: '',
                volume2m: '',
                volume3m: '',
                license: '',
                processingHistory: ''
            },
            step2: {
                countries: '',
                monthlyVolumes: '',
                currencies: '',
                avgTransaction: '',
                chargebackRate: '',
                refundRate: ''
            },
            step3: {
                platform: '',
                trafficType: '',
                cardPayouts: '',
                integrationPlatform: ''
            }
        }
    }

    return {
        currentStep,
        formData,
        formSteps,
        isLastStep,
        isFirstStep,
        nextStep,
        previousStep,
        validateStep,
        validateForm,
        resetForm
    }
})
