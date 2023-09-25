<script setup lang="ts">
import MenuIcon from '@/icons/MenuIcon.vue'
import { useCommonStore } from './stores/common'
import MoonIcon from '@/icons/MoonIcon.vue'
import SunIcon from '@/icons/SunIcon.vue'
import RobotIcons from '@/icons/RobotIcon.vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import NavMenu from '@/components/NavMenuComponent.vue'
import { ref } from 'vue'

const i18n = useI18n()
const { t } = i18n

const commonStore = useCommonStore()
const screenData = storeToRefs(commonStore).screenData
const color = storeToRefs(commonStore).color

const getHeader = () => {
  return import.meta.env.VITE_BANNER_TITLE
}

const cycleColor = () => {
  if (color.value === 'auto') commonStore.setColor('dark')
  else if (color.value === 'dark') commonStore.setColor('light')
  else if (color.value === 'light') commonStore.setColor('auto')
}

const cycleLang = () => {
  const all = i18n.availableLocales
  const current = i18n.availableLocales.indexOf(i18n.locale.value)

  const newL = all[(current + 1) % all.length]

  i18n.locale.value = newL
  localStorage.setItem('lang', newL)
}

const openNav = ref(false)
</script>

<template>
  <header>
    <h1>{{ getHeader() }}</h1>
    <MenuIcon v-if="screenData.width < 700" @click="openNav = true"></MenuIcon>
    <nav v-if="screenData.width > 700">
      <RouterLink :to="{ name: 'home' }">{{ t('nav.home') }}</RouterLink>
      <RouterLink :to="{ name: 'about' }">{{ t('nav.about') }}</RouterLink>
      <div class="langSwitcher" @click="cycleLang">
        <span
          v-for="(lang, id) in i18n.availableLocales"
          :key="id"
          v-show="i18n.locale.value === lang"
        >
          {{ lang }}
        </span>
      </div>
      <div class="colorSwitcher" @click="cycleColor">
        <MoonIcon v-if="color === 'dark'"></MoonIcon>
        <SunIcon v-if="color === 'light'"></SunIcon>
        <RobotIcons v-if="color === 'auto'"></RobotIcons>
      </div>
    </nav>
    <NavMenu :show="openNav" @close="openNav = false">
      <RouterLink :to="{ name: 'home' }" @click="openNav = false">{{ t('nav.home') }}</RouterLink>
      <RouterLink :to="{ name: 'about' }" @click="openNav = false">{{ t('nav.about') }}</RouterLink>
      <div class="langSwitcher" @click="cycleLang">
        <span
          v-for="(lang, id) in i18n.availableLocales"
          :key="id"
          v-show="i18n.locale.value === lang"
        >
          {{ lang }}
        </span>
      </div>
      <div class="colorSwitcher" @click="cycleColor">
        <MoonIcon v-if="color === 'dark'"></MoonIcon>
        <SunIcon v-if="color === 'light'"></SunIcon>
        <RobotIcons v-if="color === 'auto'"></RobotIcons>
      </div>
    </NavMenu>
  </header>
  <main>
    <RouterView />
  </main>
</template>

<style scoped lang="less">
header {
  @apply w-full flex justify-between items-center bg-white px-4 py-2 shadow-md
  dark:bg-gray-800;

  height: 3rem;

  h1 {
    @apply text-blue-300 text-2xl font-bold;
  }

  a {
    @apply text-gray-500 dark:text-gray-200 dark:hover:text-blue-300 hover:text-blue-300 transition-colors duration-100 ease-in-out;
  }

  .router-link-active {
    @apply text-blue-300 dark:text-blue-300;
  }

  .colorSwitcher {
    @apply flex gap-x-2 items-center transition duration-100 ease-in-out active:scale-90;

    svg {
      @apply w-6 h-6 cursor-pointer;
    }
  }

  .langSwitcher {
    @apply flex gap-x-2 justify-center transition duration-100 ease-in-out active:scale-90 cursor-pointer text-gray-500 bg-gray-100 rounded-md px-2 py-1 w-10 dark:bg-gray-600 dark:text-gray-200 dark:hover:text-blue-300 hover:text-blue-300;
  }

  nav {
    @apply flex gap-x-4 items-center select-none;
  }

  :deep(.menu) {
    @apply py-4 px-2 flex flex-col gap-y-4 items-center justify-center;
  }

  svg {
    @apply w-7 h-7 cursor-pointer transition duration-100 ease-in-out active:scale-90;
  }
}

main {
  @apply flex flex-col items-center px-4 lg:px-28 py-4 gap-y-1 sm:gap-y-4;
  height: calc(100% - 3rem);
}
</style>
