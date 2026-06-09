<script setup lang="ts">
import { ref } from 'vue'

const cart = ref<{ id: string; title: string }[]>([])
</script>

<template>
  <div v-for="item in cart">{{ item.title }}</div>
</template>
