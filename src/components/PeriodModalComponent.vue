<script setup lang="ts">
import XIcon from '@/icons/XIcon.vue'
import { useDataStore, type Event } from '@/stores/data'
import { getColor } from '@/utils/classColor'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  periodData: {
    events: Event[]
    date: Date
    period: number
  }
  show: boolean
}>()

const emits = defineEmits<{
  (e: 'close'): void
}>()

const dataStore = useDataStore()
const currentWeek = storeToRefs(dataStore).currentWeek
const teachers = storeToRefs(dataStore).teachers
const rooms = storeToRefs(dataStore).rooms
const classess = storeToRefs(dataStore).classes

const getTimes = (periodIndex: number) => {
  const midnight = new Date(currentWeek.value.dates[0]).getTime()

  const start = new Date(midnight + currentWeek.value.hourOffsets[periodIndex].startOffset)
  const end = new Date(midnight + currentWeek.value.hourOffsets[periodIndex].endOffset)

  return {
    start: `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')}`,
    end: `${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="modalContainer" v-if="show">
        <div class="background" @click="emits('close')"></div>
        <div class="modal">
          <div class="head">
            <div class="date">
              {{ new Date(periodData.date).getDate() }}.
              {{ new Date(periodData.date).getMonth() + 1 }}.
              {{ new Date(periodData.date).getFullYear() }}
            </div>
            <div class="right">
              <div class="period">
                {{ getTimes(periodData.period).start }} -
                {{ getTimes(periodData.period).end }}
              </div>
              <XIcon @click="emits('close')"></XIcon>
            </div>
          </div>
          <div class="events">
            <div class="event" v-for="(event, id) in periodData.events" :key="id">
              <div class="main">
                <span class="eventName" :style="{ color: getColor(event.title.short) }">
                  {{ event.title.long }}</span
                >
                - {{ rooms.get(event.classroomKey ?? '')?.display }}
              </div>
              <div class="teacher">{{ teachers.get(event.teacherKey ?? '')?.fullName }}</div>
              <div class="class">{{ classess.get(event.classKey ?? '')?.display }}</div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="less" scoped>
.modalContainer {
  @apply absolute w-full h-full top-0 left-0 flex justify-center items-center z-40;

  .background {
    @apply absolute top-0 left-0 bg-black bg-opacity-50 z-40 w-full h-full;
  }

  .modal {
    @apply z-50 bg-white rounded-lg p-4 self-center w-full  sm:w-1/2 sm:!h-1/2 sm:max-w-lg flex flex-col gap-4 dark:bg-gray-800 dark:text-gray-200;
    height: 90%;
    width: 90%;

    .head {
      @apply flex flex-row justify-between text-base font-semibold text-gray-500 gap-2 dark:text-gray-400;

      .right {
        @apply flex flex-row gap-2 items-center;

        svg {
          @apply w-5 h-5 cursor-pointer;
        }
      }
    }

    .events {
      @apply flex flex-col gap-2 overflow-y-auto;

      .event {
        @apply bg-gray-100 rounded-md mr-1 p-2 flex flex-col gap-1 text-gray-700 dark:bg-gray-700 dark:text-gray-200;

        .teacher {
          @apply text-gray-500 dark:text-gray-400;
        }

        .main {
          .eventName {
            @apply text-base font-medium;
          }
        }
      }
    }
  }
}

.modal-enter-active,
.modal-leave-active {
  @apply transition-all;
}
.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}
</style>
