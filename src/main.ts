import './assets/main.less'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'

import { useDataStore } from '@/stores/data'
import { useCommonStore } from './stores/common'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

async function start() {
  await useDataStore().init()
  await useCommonStore().init()

  document.querySelector('#waiting')?.remove()
  app.mount('#app')
}

start()
