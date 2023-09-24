<script setup lang="ts">
import { useDataStore, type Event as PeriodEvent } from '@/stores/data'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import type { FilterData } from '@/components/TimetableComponent.vue'
import TimetableComponent from '@/components/TimetableComponent.vue'
import FilterInputComponent from '@/components/FilterInputComponent.vue'
import { storeToRefs } from 'pinia'
import TrashIcon from '@/icons/TrashIcon.vue'
import ChevronUp from '@/icons/ChevronUpIcon.vue'
import { useCommonStore } from '@/stores/common'
import INeedMoreBulletsComponent from '@/components/INeedMoreBulletsComponent.vue'
import PeriodModalComponent from '@/components/PeriodModalComponent.vue'

const commonStore = useCommonStore()
const screenData = storeToRefs(commonStore).screenData

const dataStore = useDataStore()
const getSortedTeachers = storeToRefs(dataStore).getSortedTeachers
const getSortedRooms = storeToRefs(dataStore).getSortedRooms
const getSortedClasses = storeToRefs(dataStore).getSortedClasses

const filterData = ref<FilterData>({
  teachers: new Set([getSortedTeachers.value[0].key]),
  classes: new Set([]),
  rooms: new Set([]),
  globalSearch: ['']
})

const hideFilters = ref(screenData.value.width < 900)

const teacherDropdownData = computed(() => {
  return getSortedTeachers.value.map((teacher) => ({
    display: teacher.short,
    value: teacher.key
  }))
})

const roomDropdownData = computed(() => {
  return getSortedRooms.value.map((room) => ({
    display: room.display,
    value: room.key
  }))
})

const classesDropdownData = computed(() => {
  return getSortedClasses.value.map((class_) => ({
    display: class_.display,
    value: class_.key
  }))
})

const updateTeachers = (data: {
  value: {
    display: string
    value: string
  }
  mode: 'replace' | 'add'
}) => {
  if (data.mode === 'replace') filterData.value.teachers = new Set([data.value.value])
  else filterData.value.teachers.add(data.value.value)
}

const updateRooms = (data: {
  value: {
    display: string
    value: string
  }
  mode: 'replace' | 'add'
}) => {
  if (data.mode === 'replace') filterData.value.rooms = new Set([data.value.value])
  else filterData.value.rooms.add(data.value.value)
}

const updateClasses = (data: {
  value: {
    display: string
    value: string
  }
  mode: 'replace' | 'add'
}) => {
  if (data.mode === 'replace') filterData.value.classes = new Set([data.value.value])
  else filterData.value.classes.add(data.value.value)
}

const timer = ref()
const updateGlobalSearch = (e: Event) => {
  clearTimeout(timer.value)

  timer.value = setTimeout(() => {
    const data = (e.target as HTMLInputElement).value

    filterData.value.globalSearch[0] = data
    console.log(filterData.value.globalSearch)
  }, 500)
}

const clearFilters = () => {
  filterData.value.classes.clear()
  filterData.value.teachers.clear()
  filterData.value.rooms.clear()
  filterData.value.globalSearch[0] = ''
}

const periodModalData = ref<{
  show: boolean
  period: {
    events: PeriodEvent[]
    date: Date
    period: number
  }
}>({
  show: false,
  period: {
    events: [],
    date: new Date(),
    period: 0
  }
})

const { t } = useI18n()
</script>

<template>
  <div class="showFilters" @click="hideFilters = false" v-if="hideFilters">Show filters</div>

  <div class="filters" v-show="!hideFilters">
    <FilterInputComponent
      type="dropdown"
      :title="t('home.filterTitles.teachers')"
      :dropdownData="teacherDropdownData"
      @dropdownChange="updateTeachers"
      :reset="filterData.teachers.size === 0"
    ></FilterInputComponent>
    <FilterInputComponent
      type="dropdown"
      :title="t('home.filterTitles.rooms')"
      :dropdownData="roomDropdownData"
      @dropdownChange="updateRooms"
      :reset="filterData.rooms.size === 0"
    ></FilterInputComponent>
    <FilterInputComponent
      type="dropdown"
      :title="t('home.filterTitles.classes')"
      :dropdownData="classesDropdownData"
      @dropdownChange="updateClasses"
      :reset="filterData.classes.size === 0"
    ></FilterInputComponent>
    <FilterInputComponent
      type="search"
      :placeholder="t('home.filterTitles.search')"
      :dropdownData="classesDropdownData"
      @input="updateGlobalSearch"
      :reset="filterData.globalSearch[0] === ''"
    ></FilterInputComponent>
    <div class="clearFilterButton" @click="clearFilters"><TrashIcon></TrashIcon></div>
    <div class="hideFilterButton" @click="hideFilters = true" v-if="screenData.width < 900">
      <ChevronUp></ChevronUp>
    </div>
  </div>

  <div class="appliedFilters">
    <template v-for="(filters, filters_key) in filterData" :key="filters_key">
      <INeedMoreBulletsComponent
        v-for="(filter, id) in filters"
        :key="id"
        :type="filters_key"
        :dataKey="filter"
        v-show="filter !== ''"
        @removeFilter="
          (data) => {
            if (data.key === 'globalSearch') filterData.globalSearch[0] = ''
            else filterData[data.key].delete(data.value)
          }
        "
      ></INeedMoreBulletsComponent>
    </template>
  </div>

  <TimetableComponent
    :filterData="filterData"
    @changeFilter="
      (data) => {
        filterData.classes.clear()
        filterData.teachers.clear()
        filterData.rooms.clear()
        filterData.globalSearch[0] = ''

        // @ts-ignore this will never return a globalSearch string
        filterData[data.key] = new Set(data.value)
      }
    "
    @openPeriod="
      (data) => {
        periodModalData.show = true
        periodModalData.period = data
      }
    "
  ></TimetableComponent>

  <PeriodModalComponent
    :show="periodModalData.show"
    :periodData="periodModalData.period"
    @close="periodModalData.show = false"
  ></PeriodModalComponent>
</template>

<style scoped lang="less">
.timetable {
  @apply w-full;
}

.filters,
.appliedFilters {
  @apply w-full flex flex-wrap gap-x-4 gap-y-2 items-center p-2;
}

.appliedFilters {
  @apply lg:max-h-28 min-h-min overflow-y-auto;

  &::-webkit-scrollbar {
    @apply hidden;
  }
}

.showFilters {
  @apply w-full flex items-center px-2 cursor-pointer text-left text-gray-600 underline hover:text-blue-300 transition-colors duration-100 dark:text-gray-200 dark:hover:text-blue-300;
}

.clearFilterButton {
  @apply w-8 h-8 rounded-full bg-red-300 flex items-center justify-center cursor-pointer flex items-center justify-center active:scale-90 transition-all;
}

.hideFilterButton {
  @apply w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center cursor-pointer flex items-center justify-center active:scale-90 transition-all;
}
</style>
