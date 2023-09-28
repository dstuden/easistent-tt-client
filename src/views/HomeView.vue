<script setup lang="ts">
import { useDataStore, type Event as PeriodEvent } from '@/stores/data'
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref, watch } from 'vue'
import type { FilterData } from '@/components/TimetableComponent.vue'
import TimetableComponent from '@/components/TimetableComponent.vue'
import FilterInputComponent from '@/components/FilterInputComponent.vue'
import { storeToRefs } from 'pinia'
import TrashIcon from '@/icons/TrashIcon.vue'
import ChevronUp from '@/icons/ChevronUpIcon.vue'
import { useCommonStore } from '@/stores/common'
import INeedMoreBulletsComponent from '@/components/INeedMoreBulletsComponent.vue'
import PeriodModalComponent from '@/components/PeriodModalComponent.vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

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

const queryString = computed(() => {
  return {
    teachers: route.query.teachers?.toString().split(','),
    classes: route.query.classes?.toString().split(','),
    rooms: route.query.rooms?.toString().split(','),
    globalSearch: route.query.globalSearch?.toString()
  }
})

const syncFilterData = (data: typeof queryString.value) => {
  filterData.value.teachers = new Set(
    data.teachers?.filter((teacher) => dataStore.teachers.get(teacher))
  )

  filterData.value.classes = new Set(
    data.classes?.filter((class_) => dataStore.classes.get(class_))
  )

  filterData.value.rooms = new Set(data.rooms?.filter((room) => dataStore.rooms.get(room)))

  filterData.value.globalSearch[0] = data.globalSearch ?? ''
}

const changeFilters = (
  mode: 'replace' | 'add' | 'remove',
  data: {
    teachers?: string[]
    classes?: string[]
    rooms?: string[]
    globalSearch?: string
  }
) => {
  let q

  if (mode === 'replace')
    q = {
      teachers: [...(data.teachers ?? [])].join(','),
      classes: [...(data.classes ?? [])].join(','),
      rooms: [...(data.rooms ?? [])].join(','),
      globalSearch: data.globalSearch ?? ''
    }
  else if (mode === 'add')
    q = {
      teachers: [...(queryString.value.teachers ?? []), ...(data.teachers ?? [])].join(','),
      classes: [...(queryString.value.classes ?? []), ...(data.classes ?? [])].join(','),
      rooms: [...(queryString.value.rooms ?? []), ...(data.rooms ?? [])].join(','),
      globalSearch: data.globalSearch ?? ''
    }
  else
    q = {
      teachers: [...(queryString.value.teachers ?? [])]
        .filter((teacher) => !data.teachers?.includes(teacher))
        .join(','),
      classes: [...(queryString.value.classes ?? [])]
        .filter((class_) => !data.classes?.includes(class_))
        .join(','),
      rooms: [...(queryString.value.rooms ?? [])]
        .filter((room) => !data.rooms?.includes(room))
        .join(','),
      globalSearch:
        data.globalSearch?.length === 0
          ? ''
          : queryString.value.globalSearch?.replace(data.globalSearch ?? '', '')
    }

  const query = Object.fromEntries(Object.entries(q).filter(([_, value]) => value !== ''))

  router.push({
    query
  })
}

onMounted(() => {
  syncFilterData(queryString.value)

  watch(queryString, (data) => {
    syncFilterData(data)
  })
})

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

const updateOnFilterEvent = (data: {
  key: keyof typeof filterData.value
  value: {
    display: string
    value: string
  }
  mode: 'replace' | 'add'
}) => {
  if (data.key === 'globalSearch') return

  changeFilters(data.mode, {
    [data.key]: [data.value.value]
  })
}

const timer = ref()
const updateGlobalSearch = (e: Event) => {
  clearTimeout(timer.value)

  timer.value = setTimeout(() => {
    const data = (e.target as HTMLInputElement).value

    changeFilters('add', {
      globalSearch: data
    })
  }, 500)
}

const clearFilters = () => {
  changeFilters('replace', {
    teachers: [],
    classes: [],
    rooms: [],
    globalSearch: ''
  })
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
      @dropdownChange="(d) => updateOnFilterEvent({ ...d, key: 'teachers' })"
      :reset="filterData.teachers.size === 0"
    ></FilterInputComponent>
    <FilterInputComponent
      type="dropdown"
      :title="t('home.filterTitles.rooms')"
      :dropdownData="roomDropdownData"
      @dropdownChange="(d) => updateOnFilterEvent({ ...d, key: 'rooms' })"
      :reset="filterData.rooms.size === 0"
    ></FilterInputComponent>
    <FilterInputComponent
      type="dropdown"
      :title="t('home.filterTitles.classes')"
      :dropdownData="classesDropdownData"
      @dropdownChange="(d) => updateOnFilterEvent({ ...d, key: 'classes' })"
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
            changeFilters('remove', {
              [data.key]: [data.value]
            })
          }
        "
      ></INeedMoreBulletsComponent>
    </template>
  </div>

  <TimetableComponent
    :filterData="filterData"
    @changeFilter="
      (data) => {
        changeFilters('replace', {
          [data.key]: [...data.value]
        })
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
