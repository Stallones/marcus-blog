<script setup lang="ts">
import { useBottomRightState } from "./bottomRightState";
import { toggleReadingMode } from "@/components/Article/readingMode";
import { throttle } from "@/utils/optimize.ts";

const { uniqueItems, isExpanded, toggleExpanded, hasItem, scrollPercentage } =
  useBottomRightState();

// ── 滚动百分比（全局计算） ──
window.addEventListener(
  "scroll",
  throttle(() => {
    window.requestAnimationFrame(() => {
      const pageHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;
      const screenHeight =
        document.documentElement.clientHeight || document.body.clientHeight;
      const scrollHeight = pageHeight - screenHeight;
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      scrollPercentage.value =
        Math.floor((scrollTop / scrollHeight) * 100) + "%";
    });
  }, 40)
);
</script>

<template>
  <div class="container_div">
    <!-- 独有功能项（默认收起，点击「更多」展开） -->
    <div class="hide" :class="{ visible: isExpanded }">
      <div v-if="hasItem('readingMode')" @click="toggleReadingMode()">
        <ReadingMode />
      </div>
      <div v-if="hasItem('toComment')" class="mb-4">
        <GoBottom />
      </div>
    </div>

    <!-- 更多按钮（有独有项时显示） -->
    <div v-if="uniqueItems.length" class="my-4" @click="toggleExpanded">
      <BottomRightMore />
    </div>

    <!-- 全局功能项（始终显示） -->
    <div class="mb-4">
      <ToTop />
    </div>

    <!-- 滚动百分比（全局） -->
    <div class="scroll_percentage">
      {{ scrollPercentage }}
    </div>

    <!-- 亮暗色切换 -->
    <div class="mt-4 color-mode-toggle">
      <ColorModeToggle />
    </div>
  </div>
</template>

<style scoped lang="scss">
.container_div {
  z-index: 9999;
  position: fixed;
  bottom: 4rem;
  right: 2rem;
  padding: 0.5rem;
  width: 60px;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;

  @media screen and (max-width: 768px) {
    bottom: 0;
    right: 0.5rem;
  }

  .scroll_percentage {
    background: var(--mao-scroll-percentage-bg);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.9rem;
    font-weight: bold;

    @media screen and (max-width: 768px) {
      width: 40px;
      height: 40px;
    }
  }

  .color-mode-toggle {
    transform: scale(0.55);
    transform-origin: center;
  }
}

.hide {
  opacity: 0;
  height: auto;
  transition: all 0.5s;
  transform: translate(90px, 0);
}

.visible {
  height: auto;
  opacity: 1;
  transform: translate(0, 0);
  transition: all 0.5s;
}
</style>
