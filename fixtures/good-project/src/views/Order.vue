<script setup lang="ts">
import { useOrder } from '../composables/useOrder'

const { orders, loadOrders } = useOrder()

loadOrders()
</script>

<template>
  <div>{{ orders }}</div>
</template>
