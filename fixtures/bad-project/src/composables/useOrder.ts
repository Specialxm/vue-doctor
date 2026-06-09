import { ref } from 'vue'

export const useOrder = () => {
  const orders = ref<unknown[]>([])

  const loadOrders = async () => {
    const response = await fetch('/api/orders')
    orders.value = await response.json()
  }

  return { orders, loadOrders }
}
