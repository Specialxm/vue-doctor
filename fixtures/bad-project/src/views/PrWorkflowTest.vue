<script setup lang="ts">
import { ref } from 'vue'

const items = ref<string[]>([])
</script>

<template>
  <div v-for="item in items">{{ item }}</div>
</template>
