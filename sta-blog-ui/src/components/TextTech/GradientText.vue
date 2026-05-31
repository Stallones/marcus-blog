<template>
  <span
    class="gradient-text"
    :style="gradientStyle"
    aria-label="text"
  >{{ text }}</span>
</template>

<script setup lang="ts">
/**
 * GradientText — 渐变文字效果
 * 用法：<GradientText text="Hello" /> 或 <GradientText text="Hello" :colors="['#f00','#0f0','#00f']" :animate="true" />
 */
import { computed } from "vue";

const props = withDefaults(defineProps<{
  /** 要显示的文本 */
  text: string;
  /** 渐变颜色数组，默认彩虹色 */
  colors?: string[];
  /** 是否启用渐变动画（流动效果） */
  animate?: boolean;
}>(), {
  colors: () => ["#f79533", "#f37055", "#ef4e7b", "#a166ab", "#5073b8", "#1098ad", "#07b39b", "#6fba82"],
  animate: false,
});

const gradientStyle = computed(() => {
  const colors = props.colors;
  const gradient = `linear-gradient(${props.animate ? "var(--angle, 90deg)" : "90deg"}, ${colors.join(", ")})`;
  return {
    "background-image": gradient,
    ...(props.animate ? { "--angle": "90deg" } : {}),
  };
});
</script>

<style scoped lang="scss">
.gradient-text {
  display: inline-block;
  font-weight: 700;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 100% 100%;

  // 仅当 animate 为 true 时触发（通过 CSS .animated 类）
  &.animated,
  &[style*="--angle"] {
    background-size: 300% 300%;
    animation: gradient-flow 4s ease infinite;
  }
}

@keyframes gradient-flow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
