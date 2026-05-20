<template>
  <div v-if="useService.afterCheckService">
    <router-view></router-view>
  </div>

  <Loading></Loading>
  <MusicAi />
  <DevToolsBlocker :enableDevToolsBlocker="true" />
  <ContextMenu />
</template>

<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import useWebsiteStore from "@/store/modules/website.ts";
import DevToolsBlocker from "@/components/DevToolsBlocker.vue";
import ContextMenu from "@/components/ContextMenu.vue";
import MusicAi from "@/components/Music-ai/index.vue";
import { useServiceStore } from "./store/modules/service";
import DayNightToggle from "./layouts/components/DayNightToggle.vue";

const useService = useServiceStore();
const useWebsite = useWebsiteStore();

onMounted(async () => {
  //服务状态
  await useService.checkService();
  //网站信息
  useWebsite.getInfo();
});

//  深色切换
useDark({
  selector: "html",
  attribute: "class",
  valueLight: "light",
  valueDark: "dark",
});

useDark({
  onChanged(dark) {
    useToggle(dark);
  },
});
</script>

<style scoped lang="scss"></style>
