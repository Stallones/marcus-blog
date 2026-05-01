<script setup lang="ts">
defineProps({
  // 内容区是否只需要父容器
  onlyFatherContainer: {
    type: Boolean,
    default: false
  },
  // 是否有侧边栏
  isSideBar: {
    type: Boolean,
    default: false
  },
  // 上边距
  marginTop: {
    type: String,
    default: '0'
  }
})
</script>

<template>

  <div class="header">
    <slot name="header"/>
  </div>

  <div v-if="onlyFatherContainer">
    <div>
      <slot name="banner"/>
    </div>
    <div class="is_banner_container" style="display: flex;justify-content: center; min-height: calc(100vh - 50px);">
      <!-- 内容区 -->
      <div class="content_container" style="width: 100%;max-width: 100rem">
        <slot name="content"/>
      </div>
      <!-- 侧边栏 -->
      <div class="information_container" v-if="isSideBar">
        <slot name="information"/>
      </div>
    </div>
  </div>

  <div class="div_container" :style="'margin-top:'+marginTop" v-if="!onlyFatherContainer">
    <!-- 内容区 -->
    <div class="content_container">
      <slot name="content"/>
    </div>
    <!-- 侧边栏 -->
    <div class="information_container" v-if="isSideBar">
      <slot name="information"/>
    </div>
  </div>
  <div>
    <slot name="footer"/>
  </div>
</template>

<style scoped lang="scss">

.div_container {
  // 过渡效果
  transition: margin 0.5s;
  margin: 0 0;

  // 提前声明，避免在嵌套规则之后出现普通声明导致 mixed-decls 警告
  //border: red 1px solid;
  display: flex;
  justify-content: center;
  padding-bottom: 2rem;
  width: 100%;
  min-height: calc(100vh - 50px); // 确保内容区至少有视口高度（减去header高度），让footer保持在底部

  @media screen and (max-width: 1200px) {
    margin: 0;
  }
}

.content_container {
  height: 100%;
  width: 60%;
  max-width: 70rem;
  transition: padding 0.5s;
  padding: 1rem; /* 提前声明，避免 mixed-decls 警告 */
  background-color: var(--el-bg-color); /* 提前到 @media 之前 */
  // background-color: #000000; /* 提前到 @media 之前 */
  border-radius: .5em; /* 提前到 @media 之前 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* 提前到 @media 之前 */
  //border: red 1px solid;
  @media screen and (max-width: 910px) {
    width: 100%;
    padding: 0.2rem;
  }
}

.information_container {
  width: 23%;
  min-height: 100%;
  max-width: 25rem;
  transition: width 0.5s;
  @media screen and (max-width: 910px) {
    display: none;
  }
  @media screen and (max-width: 1200px) {
    width: 30%;
  }
  //border: yellow 1px solid;
}

.father_container {
  //border: red 1px solid;
  width: 100%;
  margin-bottom: 7rem;
  padding: 0.2rem;
  background-color: white;
  border-radius: $border-radius;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.is_banner_container {
  margin: 0 10%;
  height: 100%;
  display: flex;
  padding-bottom: 2rem;
  transition: margin 0.5s;
  @media screen and (max-width: 1200px) {
    margin: 0 5%;
  }
  @media screen and (max-width: 650px) {
    margin: 0 2%;
  }
}
</style>