<script setup lang="ts">
import { useDataStore } from '@/stores/data'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import type { FilterData } from '@/components/TimetableComponent.vue'
import XIcon from '@/icons/XIcon.vue'

const dataStore = useDataStore()
const teachers = storeToRefs(dataStore).teachers
const classes = storeToRefs(dataStore).classes
const rooms = storeToRefs(dataStore).rooms

const props = defineProps<{
  type: keyof FilterData
  dataKey: string
}>()

const emits = defineEmits<{
  (e: 'removeFilter', data: { key: keyof FilterData; value: string }): void
}>()

const getTypeColor = computed(() => {
  switch (props.type) {
    case 'teachers':
      return 'bg-blue-500'
    case 'rooms':
      return 'bg-yellow-500'
    case 'classes':
      return 'bg-green-500'
    case 'globalSearch':
      return 'bg-purple-500'
    default:
      return 'bg-red-500'
  }
})

const getTitle = computed(() => {
  switch (props.type) {
    case 'teachers':
      return teachers.value.get(props.dataKey)?.short
    case 'rooms':
      return rooms.value.get(props.dataKey)?.display
    case 'classes':
      return classes.value.get(props.dataKey)?.display
    case 'globalSearch':
      return props.dataKey
    default:
      return 'Error'
  }
})
</script>

<template>
  <div
    class="bullet"
    :class="getTypeColor"
    @click="
      emits('removeFilter', {
        key: props.type,
        value: props.dataKey
      })
    "
  >
    <XIcon></XIcon>
    {{ getTitle }}
  </div>
</template>

<style lang="less">
.bullet {
  @apply flex flex-row items-center gap-2 inline-block rounded-full px-2 py-1 text-sm font-medium text-gray-100 shadow-md cursor-pointer transition duration-100  active:scale-90;

  svg {
    @apply w-4 h-4;

    path {
      @apply fill-gray-200;
    }
  }
}
</style>
