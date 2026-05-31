<template>
  <header class="full-header">
    
    <Nav />

    <div class="hero-page">
      <!-- 背景轮播图 -->
      <Images />

      <!-- 标题 + 打字机 + 波浪 + 按钮-->
      <Brand />

      <!-- 鼠标拖尾 -->
      <MouseTrail />

      <Particles />
    </div>
  </header>
</template>

<script setup lang="ts">
import Images from "@/components/Header/Images.vue";
import Brand from "@/components/Header/Brand.vue";
import Particles from "@/components/Header/Particles.vue";
import MouseTrail from "@/components/Header/MouseTrail.vue";
import Nav from "@/components/Nav/index.vue";
</script>

<style scoped lang="scss">
.full-header {
  position: relative;
  width: 100%;
  // height: 100vh;
  overflow: hidden;
}

</style>
