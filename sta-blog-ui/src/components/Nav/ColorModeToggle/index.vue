<template>
  <toggle-button @change="handleChange" size="1"></toggle-button>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useColorMode } from '@vueuse/core'
import ColorModeToggleBtn from '@/components/Nav/ColorModeToggle/type.ts'

const mode = useColorMode()

onMounted(() => {
  if (!customElements.get('toggle-button')) {
    customElements.define('toggle-button', ColorModeToggleBtn)
  }
})

function handleChange({ detail }: CustomEvent<'light' | 'dark' | 'auto'>) {
  mode.value = detail
}
</script>
