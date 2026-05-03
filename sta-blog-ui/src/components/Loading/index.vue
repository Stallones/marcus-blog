<template>
  <!-- 调试用：强制显示 loading，调整完成后改回 v-show="loadingStore.isLoading" -->
  <!-- <div class="loading" style="display: flex !important"> -->
  <div class="loading" v-show="loadingStore.isLoading">
    <div class="loading-container">
      <!-- 渐变进度条 -->
      <div class="progress-bar">
        <div class="progress-inner"></div>
        <div class="progress-glow"></div>
      </div>
      <!-- Loading 文字 -->
      <div class="loading-text">
        <span class="dot-animation">数据加载中</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useLoadingStore from "@/store/modules/loading.ts";
const loadingStore = useLoadingStore()
</script>

<style scoped lang="scss">

.loading {
  width: 100%;
  height: 100%;
  position: fixed;
  background: var(--el-bg-color);
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 500px;
}

// 进度条容器
.progress-bar {
  width: 100%;
  height: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

// 渐变进度条动画
.progress-inner {
  height: 100%;
  width: 100%;
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    #ff6b6b,
    #feca57,
    #48dbfb,
    #ff9ff3,
    #54a0ff,
    #5f27cd,
    #ff6b6b
  );
  background-size: 300% 100%;
  animation: gradientMove 5s ease-in-out infinite;
  position: relative;
}

// 发光效果
.progress-glow {
  position: absolute;
  top: -2px;
  left: 0;
  height: calc(100% + 4px);
  width: 60px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: glowMove 2s ease-in-out infinite;
  border-radius: 10px;
}

// 渐变色移动动画
@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

// 发光效果移动
@keyframes glowMove {
  0% {
    left: -60px;
  }
  100% {
    left: 100%;
  }
}

// Loading 文字
.loading-text {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--el-text-color-primary);
  letter-spacing: 2px;
}

// 省略号动画
.dot-animation::after {
  content: '';
  animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {
  0%, 20% {
    content: '';
  }
  40% {
    content: '.';
  }
  60% {
    content: '..';
  }
  80%, 100% {
    content: '...';
  }
}

// 深色模式适配
:deep(html.dark) {
  .progress-bar {
    background: rgba(255, 255, 255, 0.05);
  }
}
</style>
