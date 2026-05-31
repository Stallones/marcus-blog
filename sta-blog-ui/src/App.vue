<template>
  <router-view v-if="useService.afterCheckService" />

  <Loading></Loading>
  <!-- <MusicAi /> -->
   <!-- <Music /> -->
  <DevToolsBlocker :enableDevToolsBlocker="true" />
  <ContextMenu />
  <CanvasLayer :imageUrl="aaa" />
  <!-- <CanvasLayer /> -->
</template>

<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import useWebsiteStore from "@/store/modules/website.ts";
import DevToolsBlocker from "@/components/DevToolsBlocker.vue";
import ContextMenu from "@/components/ContextMenu.vue";
import MusicAi from "@/components/Music-ai/index.vue";
import Music from "@/components/Music/index.vue";
import { useServiceStore } from "./store/modules/service";
import Loading from "@/components/Loading.vue";
import CanvasLayer from "@/components/CanvasLayer/index.vue";
import aaa from "@/assets/images/学习的史蒂夫.jpg";

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
