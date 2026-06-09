<script setup lang="ts">
import { ref } from 'vue'

const items = ref<{ id: string; name: string }[]>([])
</script>

<template>
  <template v-for="item in items">
    <div :key="item.id">{{ item.name }}</div>
  </template>
</template>
