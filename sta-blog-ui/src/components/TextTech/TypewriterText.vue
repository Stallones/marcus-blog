<template>
  <span class="typewriter-text">
    {{ output }}<span v-if="showCursor" class="tw-cursor">|</span>
  </span>
</template>

<script setup lang="ts">
/**
 * TypewriterText — 打字机效果组件
 * 用法：
 *   <TypewriterText :texts="['Hello', 'World']" />
 *   <TypewriterText url="https://v1.hitokoto.cn/?c=a&encode=json" :speed="100" :sleep="2000" />
 */
import { watch, onMounted, onUnmounted } from "vue";
import { useTypewriter, type TypewriterOptions } from "./useTypewriter";

const props = withDefaults(defineProps<TypewriterOptions & {
  /** 是否显示光标 */
  showCursor?: boolean;
}>(), {
  speed: 80,
  backSpeed: 40,
  type: "rollback",
  sleep: 2000,
  singleBack: false,
  showCursor: true,
});

const { output, start, stop } = useTypewriter(props);

// 响应式更新：texts 或 url 变化时重启
watch(
  () => [props.texts, props.url],
  () => start(props.texts),
  { deep: false }
);

onMounted(() => {
  start(props.texts);
});

onUnmounted(() => {
  stop();
});
</script>

<style scoped lang="scss">
.typewriter-text {
  display: inline-block;
}

.tw-cursor {
  opacity: 0;
  animation: tw-blink 0.7s infinite;
}

@keyframes tw-blink {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}
</style>
