import { useCommonStore } from '@/stores/common'
import { storeToRefs } from 'pinia'

const color = storeToRefs(useCommonStore()).getColor

// Too lazy so here's the original source:
// https://stackoverflow.com/a/49562686
export const hashCode = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

export const getColor = (str: string) => {
  return `hsl(${hashCode(str) % 360}, 100%, ${color.value === 'light' ? '40%' : '80%'})`
}
