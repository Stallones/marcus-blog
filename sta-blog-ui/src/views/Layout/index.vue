<template>
  <div class="layout-shell">
    <Header
      :headerType="meta.headerType"
      :title="meta.title || ''"
      :subtitle="meta.subtitle || ''"
    />
    <!-- 主内容区 -->
    <!-- <main class="layout-main" :style="{ minHeight: mainMinH + 'px' }"> -->
    <main class="layout-main" >
      <div class="main-wrapper">

        <div class="main-content">
          <router-view v-slot="{ Component, route: r }">
            <transition name="el-fade-in-linear" mode="out-in">
              <div :key="r.fullPath">
                <component :is="Component" />
              </div>
            </transition>
          </router-view>
        </div>

        <!-- 侧边栏：根据 sidebarType 动态渲染 -->
        <div class="main-sidebar" v-if="meta.sidebarType">
          <SideBar v-if="meta.sidebarType === 'default'" />
          <ArticleSideBar v-if="meta.sidebarType === 'article'" />
        </div>

      </div>
    </main>

    <!-- Footer -->
    <Footer v-if="meta.showFooter !== false" />

    <!-- 全局唯一的 BottomRightLayout -->
    <BottomRightLayout />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import Header from "@/components/Header/index.vue";
import SideBar from "@/components/Layout/SideBar/index.vue";
import ArticleSideBar from "@/components/Layout/ArticleSideBar/index.vue";
import BottomRightLayout from "@/components/BottomRight/index.vue";
import { registerGlobalItems } from "@/components/BottomRight/registerGlobal";
import { canvasHeaderH } from "@/components/CanvasLayer/index";

const route = useRoute();

const meta = computed(() => ({
  headerType: (route.meta.headerType as string) || "page",
  showFooter: route.meta.showFooter !== false,
  title: (route.meta.title as string) || "",
  subtitle: (route.meta.subtitle as string) || "",
  /** 侧边栏类型：'default' / 'article' / 不填(无侧边栏) */
  sidebarType: route.meta.sidebarType as string | undefined,
}));

/** main 最小高度与画布偏移同步：canvasHeaderH 已含 header 以下剩余空间 */
// const mainMinH = computed(() => Math.max(0, canvasHeaderH.value));

// 注册全局功能项
onMounted(() => {
  registerGlobalItems();
});
</script>

<style scoped lang="scss">
// 全局内容区最大宽度 — Nav / Main / Footer 共享
$layout-max-width: 1600px;

.layout-shell {
  min-height: 100vh;

  .layout-main {
    display: flex;
    justify-content: center;
    padding: 2rem;
    transition: background-color 0.3s ease;

    @media screen and (max-width: 1200px) {
      padding: 0;
    }
  }

  .main-wrapper {
    display: flex;
    width: 100%;
    max-width: $layout-max-width;
    // gap: 1.5rem;
    justify-content: center;
    // padding-bottom: 2rem;
    padding: 2rem;
  }

  .main-content {
    flex: 2;
    min-width: 485px;
    max-width: 990px;
    padding: 1rem;
    border-radius: 0.5em;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

    @media screen and (max-width: 910px) {
      padding: 0.75rem;
      border-radius: 0;
    }
  }

  .main-sidebar {
    flex: 1;
    min-width: 250px;
    max-width: 330px;
    padding: 1rem;
    border-radius: 0.5em;

    @media screen and (max-width: 910px) {
      display: none;
    }
  }
}
</style>
