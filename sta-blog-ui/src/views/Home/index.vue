<template>
  <div class="home-content">
    <Main :is-side-bar="true" />
  </div>
</template>

<script setup lang="ts">
import Main from "@/views/Home/Main/index.vue"
</script>

<style lang="scss" scoped>
.home-content {
  // width: 100%; /* 冗余：block 元素自动撑满 */
  @media screen and (max-width: 910px) {
    width: 100vw;
  }
}
</style>
