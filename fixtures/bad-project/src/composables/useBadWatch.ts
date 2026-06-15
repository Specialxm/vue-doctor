import { ref, watch } from 'vue'

export const useBadWatch = () => {
  const count = ref(0)

  watch(count, () => {
    count.value = count.value + 1
  })

  return { count }
}
