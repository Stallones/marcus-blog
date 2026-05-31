<template>
  <!-- 移动端导航栏 -->
  <div class="move_nav" :class="{ hidden: isMenuHidden }">
    <div class="nav-left">
      <div class="drawer-trigger" @click="drawer = true">
        <SvgIcon
          name="directory_icon"
          width="30"
          height="30"
          color="#409EFF"
          class="icon"
        />
      </div>
      <ColorModeToggle />
    </div>

    <div class="nav-right">
      <SearchByDB :is-service-available="isServiceAvailable" />
      <UserLogin :is-service-available="isServiceAvailable" />
    </div>
  </div>

  <!-- 移动端抽屉菜单 -->
  <el-drawer
    v-model="drawer"
    :with-header="true"
    size="40%"
    direction="ltr"
    :show-close="false"
  >
    <template #header>
      <span style="font-size: 1.2rem">导航</span>
      <el-button
        :icon="Close"
        style="background: none; font-size: 1.5rem; width: 30px; border: none"
        @click="drawer = false"
      />
    </template>
    <template #default>
      <MoveMenu @update:closeDrawer="drawer = false" />
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Close } from "@element-plus/icons-vue";
import SvgIcon from "@/components/SvgIcon.vue";
import ColorModeToggle from "./ColorModeToggle/index.vue";
import SearchByDB from "./SearchByDB.vue";
import UserLogin from "./UserLogin.vue";
import MoveMenu from "@/components/Layout/Header/MoveMenu/index.vue";
import { useServiceStore } from "@/store/modules/service";

const isServiceAvailable = useServiceStore().isServiceAvailable;
const drawer = ref(false);

// 滚动显隐
const isMenuHidden = ref(false);
let lastScrollTop = 0;

const handleScroll = () => {
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (currentScrollTop <= 0) {
    isMenuHidden.value = false;
  } else {
    isMenuHidden.value = currentScrollTop > lastScrollTop;
  }

  lastScrollTop = Math.max(0, currentScrollTop);
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped lang="scss">
.move_nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 45px;
  padding: 0 1rem;
  position: fixed;
  top: 0;
  z-index: 10;
  width: 100vw;
  box-sizing: border-box;
  background-color: var(--mao-nav-bg);
  backdrop-filter: blur(6px);
  transition: top 0.3s ease-in-out;
  border-bottom: 1px solid var(--mao-nav-border);

  html.dark & {
    background-color: var(--mao-nav-bg);
    border-bottom-color: var(--mao-nav-border);
  }

  &.hidden {
    top: -45px;
  }

  @media screen and (min-width: 911px) {
    display: none;
  }
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.drawer-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
