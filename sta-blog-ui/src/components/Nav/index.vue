<template>
  <nav
    class="hh-nav"
    :class="{ 'nav-hidden': isHidden, 'nav-transparent': isTransparent }"
  >
    <div class="menu-left">
      <span class="blog-info">
        <a href="/">{{ useWebsite.webInfo?.websiteName }}</a>
      </span>

      <NavList />
    </div>
    <div class="menu-right">
      <!-- <ColorModeToggle /> -->
      <SearchByDB :is-service-available="isServiceAvailable" />
      <UserLogin :is-service-available="isServiceAvailable" />
    </div>
  </nav>

  <div class="hh-mob-nav">
    <NavForMob />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
// import ColorModeToggle from "./ColorModeToggle/index.vue";
import NavList from "./NavList.vue";
import SearchByDB from "./SearchByDB.vue";
import UserLogin from "./UserLogin.vue";
import useWebsiteStore from "@/store/modules/website.ts";
import { useServiceStore } from "@/store/modules/service";
import NavForMob from "./NavForMob.vue";

const useWebsite = useWebsiteStore();
const isServiceAvailable = useServiceStore().isServiceAvailable;
const route = useRoute();

const isHidden = ref(false);
const isTransparent = ref(false);
let lastScrollTop = 0;
let scrollTimeout: number | undefined;

const handleScroll = () => {
  const currentScrollTop =
    window.pageYOffset || document.documentElement.scrollTop;
  const isHomePage = route.path === "/";

  // 首页且滚动位置为0时，透明菜单
  if (currentScrollTop === 0 && isHomePage) {
    isTransparent.value = true;
  }
  // else if(route.path.concat('article')) {
  //   // 文章页和相册页始终显示菜单
  //   isHidden.value = false;

  // }
  else {
    //   // 保留原有逻辑：向下滚动隐藏，向上滚动显示
    isHidden.value = currentScrollTop > lastScrollTop;
  }

  // 立即更新背景透明状态
  isTransparent.value = currentScrollTop === 0;

  lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; // For Mobile or negative scrolling
};

const debounceBackground = () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = window.setTimeout(() => {
    const currentScrollTop =
      window.pageYOffset || document.documentElement.scrollTop;
    isTransparent.value = currentScrollTop === 0;
  }, 100); // 100ms 防抖时间
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("scroll", debounceBackground);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("scroll", debounceBackground);
});
</script>

<style scoped lang="scss">
// ── 桌面导航 ──

nav {
  position: fixed;
  display: flex;
  justify-content: space-evenly;
  top: 0;
  height: 50px;
  width: 100%;
  z-index: 10;
  background-color: var(--mao-nav-bg);
  backdrop-filter: blur(6px);
  transition: top 0.3s ease-in-out, background-color 0.3s ease-in-out;
  border-bottom: 1px solid var(--mao-nav-border);

  &.navHidden {
    top: -50px;
  }

  &.navTransparent {
    background-color: transparent;
    backdrop-filter: none;
    border-bottom-color: transparent;
    box-shadow: none;
  }

  @media screen and (max-width: 910px) {
    display: none;
  }

  .menu-left {
    display: flex;
    flex: 1;
    align-items: center;
    font-weight: bold;

    .blog-info {
      flex: 1;
      text-align: center;
    }
  }

  .menu-right {
    display: flex;
    flex: 1;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
