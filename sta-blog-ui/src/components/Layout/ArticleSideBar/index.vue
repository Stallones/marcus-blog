<template>
  <!-- loading 占位：数据未就绪时显示骨架屏 -->
  <div v-if="!articleVO.id" class="sidebar-loading">
    <el-skeleton :rows="8" animated />
  </div>

  <!-- 数据就绪后渲染侧边栏内容 -->
  <div v-else>
    <CardInfo />
    <div class="sticky_layout">
      <ElectronicClocks />
      <div class="mt-[1.5em]">
        <DirectoryCard />
      </div>
      <div v-if="showRandom">
        <RandomArticle
          :categoryId="articleVO.categoryId.toString()"
          :articleId="(route.params.id as string) || undefined"
          title="相关推荐"
          prefix-icon="query_tasks"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";

import { useServiceStore } from "@/store/modules/service";
import { useArticleStore } from "@/store/modules/article";

import CardInfo from "@/components/CardInfo.vue";
import ElectronicClocks from "@/components/ElectronicClocks.vue";
import DirectoryCard from "@/components/SCard/DirectoryCard.vue";
import RandomArticle from "@/components/Card/RandomArticle.vue";

const route = useRoute();
const useService = useServiceStore();
const articleStore = useArticleStore();
const { articleVO } = storeToRefs(articleStore);

// 服务可用时展示相关推荐
const showRandom = ref(false);

onMounted(() => {
  if (useService.isServiceAvailable) {
    showRandom.value = true;
  }
});
</script>

<style scoped lang="scss">
.sticky_layout {
  top: 60px;
  position: sticky;
  transition: top 0.3s;
}

.sidebar-loading {
  padding: 1rem;
}
</style>
