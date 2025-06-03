import { defineStore } from 'pinia'

// Предопределенные менеджеры с их уникальными ID
const SALES_MANAGERS = {
  '1': 'Артем',
  '2': 'Темур',
  '3': 'Алекс',
  '4': 'Александр',
  '5': 'Оля',
  '6': 'Владислав',
  '7': '',
  '8': '',
  '9': '',
  '10': '',
  '11': '',
  '12': '',
  '13': '',
  '14': '',
  '15': '',
}

export const useSalesManagersStore = defineStore('salesManagers', {
  state: () => ({
    currentSaleId: localStorage.getItem('currentSaleId') || null
  }),

  getters: {
    currentSaleName: (state) => state.currentSaleId ? SALES_MANAGERS[state.currentSaleId] : null,
    isValidSaleId: (state) => state.currentSaleId in SALES_MANAGERS
  },

  actions: {
    setSaleId(id) {
      if (id in SALES_MANAGERS) {
        this.currentSaleId = id
        localStorage.setItem('currentSaleId', id)
        return true
      }
      return false
    },

    clearSaleId() {
      this.currentSaleId = null
      localStorage.removeItem('currentSaleId')
    }
  }
})
