<script setup lang="ts">
import { useOrder } from '../composables/useOrder'

const { orders, loadOrders } = useOrder()

loadOrders()
</script>

<template>
  <div v-for="order in orders" :key="order.id">{{ order }}</div>
</template>
