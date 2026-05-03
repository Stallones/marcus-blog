<script setup lang="ts">
const login_bg = import.meta.env.VITE_MINIO_SERVE + '/blog/@SYB1[VP3FD01[03P`HBGQ0.png';
</script>

<template>
  <Header/>
  <div style="width: 100vw;height: 100vh;overflow: hidden;display: flex">
    <!-- 左边区域 -->
    <div class="left-card">
      <el-image style="width: 100%;height: 100%" fit="cover"
                :src="login_bg"/>
    </div>
    <div class="welcome-title">
      <div>欢迎来到我的个人博客</div>
      <div style="margin-top: 10px">在这里你可以学习如何使用Java，如何搭建网站，如何拥有自己的个人网站</div>
    </div>
    <!-- 右边区域 -->
    <div class="right-card">
      <router-view v-slot="{Component}">
        <transition name="el-fade-in-linear" mode="out-in">
          <component :is="Component"/>
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style scoped>
.left-card{
  flex: 1;
  background-color: black
}

.right-card {
  width: 400px;
  z-index: 1;
  background-color: var(--el-bg-color);
}

@media screen and (max-width: 600px) {
  .left-card {
    display: none;
  }
  .right-card{
    width: 100vw;
  }
}

.welcome-title {
  position: absolute;
  bottom: 30px;
  left: 30px;
  color: white;
  text-shadow: 0 0 10px white;
}

.welcome-title div:first-child {
  font-size: 30px;
  font-weight: bold;
}
</style>