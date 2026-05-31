<template>
  <div class="home-content">
    <div class="announcement">
      <SvgIcon style="min-width: 30px" name="notice" color="#409EFF" />
      <GradientText weight="600" size="1.05rem">{{ useWebsite?.webInfo?.headerNotification }}</GradientText>
    </div>
    <RecommendArticle />
    <OfflineSearch v-if="!useService.isServiceAvailable" />
    <div class="essay_title">
      <el-divider border-style="dashed" content-position="left">
        <div>
          <SvgIcon name="essay_icon" color="#409EFF" class="icon" />
          <span>文章</span>
        </div>
      </el-divider>
    </div>
    <div>
      <CardEssay />
    </div>
    <div>
      <Pagination />
    </div>
    <div>
      <el-divider border-style="dashed" content-position="center">
        <div style="font-weight: bold">~~到达底部啦~~</div>
      </el-divider>
    </div>
  </div>
</template>

<script setup lang="ts">
import RecommendArticle from "@/components/RecommendArticle.vue";
import OfflineSearch from "@/components/OfflineSearch.vue";
import useWebsiteStore from "@/store/modules/website.ts";
import { useServiceStore } from "@/store/modules/service";

const useWebsite = useWebsiteStore();
const useService = useServiceStore();
</script>

<style lang="scss" scoped>
.home-content {
  @media screen and (max-width: 910px) {
    width: 100vw;
  }
}

.announcement {
  display: flex;
  height: 45px;
  padding: 0 16px;
  margin: 16px 0;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--secondary-bg, #f1f3f5);
  border: 1px solid var(--border-color-light, #e9ecef);
  transition: all 0.2s ease;
  
}
</style>
