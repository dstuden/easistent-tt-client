import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type ColorScheme = 'light' | 'dark' | 'auto'

export const useCommonStore = defineStore('common', () => {
  const color = ref<ColorScheme>('light')

  const screenData = ref({
    width: window.innerWidth,
    height: window.innerHeight
  })

  const initScreen = () => {
    window.addEventListener('resize', () => {
      screenData.value.width = window.innerWidth
      screenData.value.height = window.innerHeight
    })
  }

  const initColor = () => {
    if (localStorage.getItem('color') === 'dark') color.value = 'dark'
    else if (localStorage.getItem('color') === 'light') color.value = 'light'
    else color.value = 'auto'

    if (color.value === 'auto') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.documentElement.setAttribute('class', 'dark')
      else document.documentElement.setAttribute('class', 'light')
    } else document.documentElement.setAttribute('class', color.value)

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      if (color.value !== 'auto') return

      const newColorScheme = event.matches ? 'dark' : 'light'
      document.documentElement.setAttribute('class', newColorScheme)
    })
  }

  const setColor = (newColor: ColorScheme) => {
    if (newColor === 'auto') localStorage.removeItem('color')
    else localStorage.setItem('color', newColor)

    color.value = newColor

    if (color.value === 'auto') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.documentElement.setAttribute('class', 'dark')
      else document.documentElement.setAttribute('class', 'light')
    } else document.documentElement.setAttribute('class', color.value)
  }

  const getColor = computed(() => {
    if (color.value === 'auto') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        return 'dark'
      else return 'light'
    } else return color.value
  })

  const init = () => {
    initColor()
    initScreen()

    console.log('Common Store initialized')
  }

  return { initColor, init, setColor, color, initScreen, screenData, getColor }
})
