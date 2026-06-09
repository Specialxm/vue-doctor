<script setup lang="ts">
import { ref } from 'vue'

const items = ref<{ id: string; name: string }[]>([
  { id: '1', name: 'Apple' },
  { id: '2', name: 'Banana' },
])
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </ul>
</template>
