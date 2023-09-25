<script setup lang="ts">
import { useDataStore } from '@/stores/data'
import { useI18n } from 'vue-i18n'
import type { Event, PeriodFlag } from '@/stores/data'
import { useCommonStore } from '@/stores/common'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import EllipsisIcon from '@/icons/EllipsisIcon.vue'
import { getColor } from '@/utils/classColor'

export interface FilterData {
  teachers: Set<string>
  classes: Set<string>
  rooms: Set<string>
  globalSearch: string[]
}

const commonStore = useCommonStore()
const screenData = storeToRefs(commonStore).screenData

const dataStore = useDataStore()
const currentWeek = storeToRefs(dataStore).currentWeek
const events = storeToRefs(dataStore).events
const teachers = storeToRefs(dataStore).teachers
const classes = storeToRefs(dataStore).classes
const rooms = storeToRefs(dataStore).rooms

const props = defineProps<{
  filterData: FilterData
}>()

const emits = defineEmits<{
  (
    e: 'changeFilter',
    data: {
      key: keyof FilterData
      value: string[]
    }
  ): void
  (
    e: 'openPeriod',
    period: {
      date: Date
      period: number
      events: Event[]
    }
  ): void
}>()

const tablet = computed(() => {
  return screenData.value.width < 1300
})
const mobile = computed(() => {
  return screenData.value.width < 900
})

const getFlagColors = (flag: PeriodFlag) => {
  switch (flag) {
    case 'CANCELED':
      return 'bg-red-500 text-white'
    case 'REPLACEMENT':
      return 'bg-yellow-500 text-white'
    case 'SUBSTITUTE':
      return 'bg-green-500 text-white'
    case 'NOTDONE':
      return 'bg-blue-500 text-white'
    case 'EVENT':
      return 'bg-purple-500 text-white'
    case 'OFFICEHOURS':
      return 'bg-gray-500 text-white'
    case 'CLUB':
      return 'bg-pink-500 text-white'
    case 'HALFTIME':
      return 'bg-indigo-500 text-white'
  }
}

const getColumns = computed(() => {
  return {
    gridTemplateColumns: `min-content repeat(${currentWeek.value.dates.length}, ${
      mobile.value ? '50vw' : 'minmax(0, 1fr)'
    })`
  }
})

const getPosition = (column: number, row: number) => {
  return {
    gridRow: `${row} / span 1`,
    gridColumn: `${column} / span 1`
  }
}

const getFilteredEvents = computed(() => {
  const filtered: Event[][][] = []

  events.value.forEach((day, day_i) => {
    if (!filtered[day_i]) filtered[day_i] = []

    day.forEach((period, period_i) => {
      if (!filtered[day_i][period_i]) filtered[day_i][period_i] = []

      filtered[day_i][period_i] = period.filter((e) => {
        if (
          (props.filterData.teachers.size === 0 ||
            props.filterData.teachers.has(e.teacherKey ?? '')) &&
          (props.filterData.classes.size === 0 || props.filterData.classes.has(e.classKey ?? '')) &&
          (props.filterData.rooms.size === 0 || props.filterData.rooms.has(e.classroomKey ?? '')) &&
          (props.filterData.globalSearch[0] === '' ||
            e.title.long.toLowerCase().includes(props.filterData.globalSearch[0].toLowerCase()) ||
            (e.teacherKey &&
              teachers.value
                .get(e.teacherKey)
                ?.fullName.toLowerCase()
                .includes(props.filterData.globalSearch[0].toLowerCase())) ||
            (e.classKey &&
              classes.value
                .get(e.classKey)
                ?.display.toLowerCase()
                .includes(props.filterData.globalSearch[0].toLowerCase())) ||
            (e.classroomKey &&
              rooms.value
                .get(e.classroomKey)
                ?.display.toLowerCase()
                .includes(props.filterData.globalSearch[0].toLowerCase())))
        )
          return true
        else return false
      })
    })
  })

  return filtered
})

const isSpreadable = (period: Event[]) => {
  if (period?.length > 2) return true

  return false
}

const getWeekDay = (date: Date) => {
  const day = date.getDay()

  switch (day) {
    case 1:
      return 'monday'
    case 2:
      return 'tuesday'
    case 3:
      return 'wednesday'
    case 4:
      return 'thursday'
    case 5:
      return 'friday'
    case 6:
      return 'saturday'
    case 7:
      return 'sunday'
  }
}

const getTimes = (periodIndex: number) => {
  const midnight = new Date(currentWeek.value.dates[0]).getTime()

  const start = new Date(midnight + currentWeek.value.hourOffsets[periodIndex].startOffset)
  const end = new Date(midnight + currentWeek.value.hourOffsets[periodIndex].endOffset)

  return {
    start: `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')}`,
    end: `${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`
  }
}

const getTeacherName = (event: Event) => {
  if (event.teacherKey) {
    const teacher = teachers.value.get(event.teacherKey)

    if (teacher) {
      if (tablet.value) return teacher.initials
      else return teacher.fullName
    } else return ''
  } else return ''
}

const changeFilter = (key: keyof FilterData, value: string[]) => {
  emits('changeFilter', { key, value })
}

const { t } = useI18n()
</script>

<template>
  <div class="timetable" :style="getColumns">
    <div
      class="day"
      :style="getPosition(day_i + 2, 0)"
      v-for="(day, day_i) in currentWeek.dates"
      :key="day_i"
      :class="{ last: day_i === currentWeek.dates.length - 1 }"
    >
      <span class="weekday">{{ t(`home.days.${getWeekDay(new Date(day))}`) }}</span>
      <span class="date"
        >{{ new Date(day).getDate() }}. {{ new Date(day).getMonth() + 1 }}.
        {{ new Date(day).getFullYear() }}</span
      >
    </div>

    <div
      class="periodH"
      v-for="i in currentWeek.hourOffsets.length"
      :key="i"
      :style="getPosition(1, i + 1)"
    >
      <span>
        {{ getTimes(i - 1).start }}
      </span>
      <span>
        {{ getTimes(i - 1).end }}
      </span>
    </div>

    <!-- filler field -->
    <div class="periodH" :style="getPosition(1, 1)"></div>

    <template v-for="(day, day_i) in currentWeek.dates" :key="day">
      <div
        class="period"
        :class="{ spreadable: isSpreadable(getFilteredEvents[day_i][period - 1]) }"
        v-for="period in currentWeek.hourOffsets.length"
        :key="period"
        :style="getPosition(day_i + 2, period + 1)"
      >
        <div
          class="event"
          v-for="(event, event_i) in getFilteredEvents[day_i][period - 1]"
          :key="event_i"
        >
          <span class="title" :style="{ color: getColor(event.title.short) }">{{
            event.title.short
          }}</span>

          <span
            class="room"
            v-if="event.classroomKey"
            @click="changeFilter('rooms', [event.classroomKey!])"
          >
            - {{ event.classroomKey ? rooms.get(event.classroomKey)?.display : '' }}
            <br />
          </span>

          <span
            class="teacher"
            @click="changeFilter('teachers', [event.teacherKey!])"
            v-if="event.teacherKey"
          >
            {{ getTeacherName(event) }}
          </span>

          <br />

          <span class="class" @click="changeFilter('classes', [event.classKey!])">{{
            event.classKey ? classes.get(event.classKey)?.display : ''
          }}</span>

          <div class="flags">
            <span class="flag" :class="getFlagColors(flag)" v-for="flag in event.flags" :key="flag">
              {{ t(`home.flags.${flag}`) }}
            </span>
          </div>
        </div>

        <div
          v-if="isSpreadable(getFilteredEvents[day_i][period - 1])"
          class="spread"
          @click="
            emits('openPeriod', {
              date: new Date(day),
              period: period - 1,
              events: getFilteredEvents[day_i][period - 1]
            })
          "
        >
          <EllipsisIcon></EllipsisIcon>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="less">
::-webkit-scrollbar {
  height: 0;
}
.timetable {
  @apply grid rounded-md shadow-lg overflow-auto shadow-2xl bg-gray-100 h-full dark:bg-gray-700 dark:text-gray-200;

  .day {
    @apply flex xl:flex-row flex-col justify-between xl:items-end sticky top-0 px-2 py-1 pt-1 sm:px-4 sm:py-2 sm:pt-3 bg-gray-50 border-r border-gray-200 shadow-sm block dark:bg-gray-700 dark:border-gray-500;

    &.last {
      @apply mr-1 border-r-0;
    }

    .weekday {
      @apply text-gray-700 text-sm sm:text-base dark:text-gray-200;
    }

    .date {
      @apply text-gray-400 lg:text-sm text-xs dark:text-gray-400;
    }
  }

  .periodH {
    @apply text-gray-400 text-sm sm:text-base w-12 sm:w-16 flex flex-col items-center text-center justify-between py-2 sm:py-4 sticky left-0 bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-500;
  }

  .period {
    @apply flex 2xl:flex-row flex-col py-2 mx-2 justify-between gap-2
    border-x bg-gray-200 dark:bg-gray-600 dark:border-gray-500;

    &.spreadable .event:not(:first-of-type) {
      @apply hidden;
    }

    .spread {
      @apply rounded-md shadow-md p-4 bg-white hover:bg-gray-100 transition-colors duration-100 ease-in-out 2xl:w-1/4 text-center cursor-pointer flex items-center justify-center dark:bg-gray-700 dark:hover:bg-gray-600;

      svg {
        @apply w-5 h-5;
      }
    }

    .event {
      @apply rounded-md shadow-md p-2 sm:p-4 bg-white hover:bg-gray-100 transition-colors duration-100 ease-in-out 2xl:w-full dark:bg-gray-700 dark:hover:bg-gray-600;

      .title {
        @apply font-bold text-blue-500;
      }

      .teacher {
        @apply text-gray-400 cursor-pointer dark:text-gray-300;
      }

      .class {
        @apply text-gray-500 cursor-pointer dark:text-gray-400;
      }

      .room {
        @apply text-gray-500 cursor-pointer dark:text-gray-400;
      }

      .flags {
        @apply w-full flex flex-row overflow-x-auto items-end gap-1;
        .flag {
          @apply rounded-md px-1 py-px text-xs;
        }
      }
    }
  }
}
</style>
