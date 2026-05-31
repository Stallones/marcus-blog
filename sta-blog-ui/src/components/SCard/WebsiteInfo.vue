<script setup lang="ts">
import useWebsiteStore from "@/store/modules/website.ts";
import { ref } from 'vue'

const useWebsite = useWebsiteStore()

const differenceInDays = ref(0)
getDifferenceInDays()

watch(() => useWebsite.webInfo?.startTime, () => {
  if (useWebsite.webInfo?.startTime) {
    getDifferenceInDays()
  }
})

function getDifferenceInDays() {
  let startTime = new Date(useWebsite.webInfo?.startTime ?? '');
  let now = new Date();
  let differenceInMs = now.getTime() - startTime.getTime();
  differenceInDays.value = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
}
</script>

<template>
  <Card title="网站资讯" prefix-icon="statistics" :isScale="true">
    <div class="statistics">
      <div>文章数目：<span>{{ useWebsite.webInfo?.articleCount }}</span></div>
      <div>运行时长：<span>{{ differenceInDays }} 天</span></div>
      <div>全站字数：<span>{{ useWebsite.webInfo?.wordCount }}</span></div>
      <div>访问次数：<span>{{ useWebsite.webInfo?.visitCount }}</span></div>
      <div>最后更新：<span>{{ useWebsite.webInfo?.lastUpdateTime }}前</span></div>
    </div>
  </Card>
</template>

<style scoped lang="scss">
.statistics {
  display: flex;
  flex-direction: column;
  color: $menuActiveText;

  div {
    margin: 5px 20px;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
  }
}
</style>
