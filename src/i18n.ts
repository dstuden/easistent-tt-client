import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import si from './locales/si.json'

export type MessageSchema = typeof en

const i18n = createI18n<[MessageSchema], 'en' | 'si'>({
  legacy: false,
  locale: localStorage.getItem('lang') || 'en',
  messages: {
    en,
    si
  }
})

export default i18n
