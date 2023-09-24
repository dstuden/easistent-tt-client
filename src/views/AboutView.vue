<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <h1 v-html="t('about.title')"></h1>
  <p v-html="t('about.p1')"></p>
  <p v-html="t('about.p2')"></p>
  <p v-html="t('about.p3')"></p>
</template>

<style lang="less">
main {
  p {
    @apply text-gray-700 dark:text-gray-300;

    a {
      @apply text-blue-500 dark:text-blue-400;
    }
  }
}
</style>
