<!-- 侧边栏 -->
<template>
  <div>
    <div>
      <UserInfo />
    </div>
    <div>
      <Announcement />
    </div>
    <div>
      <ElectronicClocks />
    </div>
    <div v-if="showRandom">
      <RandomArticle />
    </div>
    <div>
      <TagListCard />
    </div>
    <ChargingList />
    <div>
      <DailySoup />
    </div>
    <div>
      <WebsiteInfo />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useServiceStore } from "@/store/modules/service";

const isServiceAvailable = useServiceStore().isServiceAvailable;
const showRandom = ref(false);
showRandom.value = isServiceAvailable;
</script>

<style lang="scss" scoped>
// 侧边栏样式已提取到独立的 SCard 组件中
</style>
