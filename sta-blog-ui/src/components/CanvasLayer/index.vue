<template>
  <!-- 底层：背景视差 -->
  <canvas ref="bgRef" class="canvas-layer canvas-bg"></canvas>
  <!-- 中层：粒子效果 -->
  <canvas v-if="particlesEnabled" ref="particlesRef" class="canvas-layer canvas-particles"></canvas>
  <!-- 顶层：鼠标拖尾 -->
  <canvas v-if="mouseTrailEnabled" ref="trailRef" class="canvas-layer canvas-trail"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { createParallax } from "./layers/BackgroundParallax";
import { createMouseTrail } from "./layers/MouseTrail";
import { createParticlesEffect } from "./layers/Particles";
import { canvasHeaderH, particlesEnabled, mouseTrailEnabled, canvasImageUrl } from "./index";

const props = defineProps<{
  /** 背景图片 URL（可选） */
  imageUrl?: string;
}>();

// ---- refs ----
const bgRef = ref<HTMLCanvasElement>();
const trailRef = ref<HTMLCanvasElement>();
const particlesRef = ref<HTMLCanvasElement>();

// ---- 实例 ----
let parallax: ReturnType<typeof createParallax> | null = null;
let trail: ReturnType<typeof createMouseTrail> | null = null;
let particles: ReturnType<typeof createParticlesEffect> | null = null;

// ---- 动画循环 ----
let rafId: number;

function animate() {
  parallax?.tick();
  trail?.tick();
  particles?.tick();
  rafId = requestAnimationFrame(animate);
}

// ---- resize 统一处理 ----
function handleResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  parallax?.resize(w, h);
  trail?.resize(w, h);
  particles?.resize(w, h);
}

// ---- 滚动触发视差重绘 ----
function handleScroll() {
  // 视差层在 tick() 内部读取 scrollY，无需额外传参
  // 但需要确保动画帧在滚动时被调度
}

onMounted(() => {
  // 同步 props.imageUrl 到共享状态
  if (props.imageUrl) {
    canvasImageUrl.value = props.imageUrl;
  }

  // 初始化各层
  if (bgRef.value) {
    parallax = createParallax();
    parallax.init(bgRef.value);
  }
  if (trailRef.value && mouseTrailEnabled.value) {
    trail = createMouseTrail();
    trail.init(trailRef.value);
  }
  if (particlesRef.value && particlesEnabled.value) {
    particles = createParticlesEffect();
    particles.init(particlesRef.value);
  }

  // 初始尺寸
  handleResize();

  // 启动统一动画循环
  animate();

  // 全局事件
  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", handleScroll, { passive: true });
});

// header 高度变化 → 触发视差重建
watch(canvasHeaderH, () => {
  parallax?.resize(window.innerWidth, window.innerHeight);
});

onUnmounted(() => {
  cancelAnimationFrame(rafId);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("scroll", handleScroll);

  parallax?.destroy();
  parallax = null;
  trail?.destroy();
  trail = null;
  particles?.destroy();
  particles = null;
});
</script>

<style scoped lang="scss">
/* 所有画布层共用：固定定位、铺满视口 */
.canvas-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}

/* z-index 从低到高：背景=粒子(同层装饰) < 鼠标拖尾 */
.canvas-bg {
  z-index: -1;
}
.canvas-particles {
  z-index: -1;
}
.canvas-trail {
  z-index: 5;
}
</style>
