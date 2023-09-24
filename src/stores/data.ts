import { defineStore } from 'pinia'
import { computed, onMounted, ref } from 'vue'

export interface Teacher {
  key: string
  short: string
  fullName: string
  initials: string
}

export interface Room {
  display: string
  key: string
  id: number
}

export interface Class {
  display: string
  key: string
  id: number
}

export interface CurrentWeek {
  week: number
  dates: Date[]
  hourOffsets: HourOffset[]
}

export type PeriodFlag =
  | 'SUBSTITUTE'
  | 'REPLACEMENT'
  | 'CANCELED'
  | 'NOTDONE'
  | 'EVENT'
  | 'OFFICEHOURS'
  | 'HALFTIME'
  | 'CLUB'

export type dayIndex = number

export interface Event {
  periodIndex: number
  dayIndex: dayIndex
  classKey: string
  title: {
    long: string
    short: string
  }
  flags: PeriodFlag[]
  teacherKey?: string
  classroomKey?: string
}

export interface HourOffset {
  startOffset: number
  endOffset: number
}

export const useDataStore = defineStore('data', () => {
  const teachers = ref<Map<string, Teacher>>(new Map<string, Teacher>())
  const rooms = ref<Map<string, Room>>(new Map<string, Room>())
  const classes = ref<Map<string, Class>>(new Map<string, Class>())
  const currentWeek = ref<CurrentWeek>({ week: 0, dates: [], hourOffsets: [] })
  const events = ref<Event[][][]>([])

  const init = async () => {
    console.log('fetching data...')

    try {
      const res = await fetch(import.meta.env.VITE_API_PATH + 'all')
      const data: {
        teachers?: Teacher[]
        rooms?: Room[]
        classes?: Class[]
        week?: {
          week: number
          dates?: Date[]
          events?: Event[]
          hourOffsets: HourOffset[]
        }
      } = await res.json()

      data.teachers?.forEach((teacher) => {
        teachers.value.set(teacher.key, teacher)
      })

      data.rooms?.forEach((room) => {
        rooms.value.set(room.key, room)
      })

      data.classes?.forEach((classroom) => {
        classes.value.set(classroom.key, classroom)
      })

      currentWeek.value = {
        week: data.week?.week ?? 0,
        dates: data.week?.dates ?? [],
        hourOffsets: data.week?.hourOffsets ?? []
      }

      data.week?.events?.forEach((event) => {
        if (!events.value[event.dayIndex]) events.value[event.dayIndex] = []

        if (!events.value[event.dayIndex][event.periodIndex])
          events.value[event.dayIndex][event.periodIndex] = []

        events.value[event.dayIndex][event.periodIndex].push(event)
      })
    } catch (e) {
      console.error(e)
    }
  }

  const getSortedTeachers = computed(() => {
    return Array.from(teachers.value.values()).sort((a, b) => a.short.localeCompare(b.short))
  })

  const getSortedRooms = computed(() => {
    return Array.from(rooms.value.values()).sort(
      (a, b) => parseInt(a.display) - parseInt(b.display)
    )
  })

  const getSortedClasses = computed(() => {
    return Array.from(classes.value.values()).sort((a, b) => a.display.localeCompare(b.display))
  })

  return {
    teachers,
    rooms,
    classes,
    currentWeek,
    events,
    getSortedTeachers,
    getSortedRooms,
    getSortedClasses,
    init
  }
})
