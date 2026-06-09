<script setup lang="ts">
import { ref } from 'vue'

const orders = ref<unknown[]>([])

async function loadOrders() {
  const response = await fetch('/api/orders')
  orders.value = await response.json()
}

loadOrders()
</script>

<template>
  <div v-for="order in orders">{{ order }}</div>
</template>
