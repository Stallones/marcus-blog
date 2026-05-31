<script setup lang="ts">
defineProps({
  // 渐变方向
  deg: {
    type: Number,
    default: 135,
  },
  // 渐变颜色列表，逗号分隔 ，如 "red,blue"
  colors: {
    type: String,
    default: '#409eff,#67c23a,#e6a23c,#f56c6c',
  },
  // 字号
  size: {
    type: String,
    default: 'inherit',
  },
  // 字重
  weight: {
    type: [String, Number],
    default: 'inherit',
  },
  // 标签（默认 span）
  tag: {
    type: String,
    default: 'span',
  },
});
</script>

<template>
  <component
    :is="tag"
    :style="{
      fontWeight: weight,
      fontSize: size,
      background: `linear-gradient(${deg}deg, ${colors})`,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }"
  >
    <slot />
  </component>
</template>
