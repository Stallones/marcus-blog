<template>
  <header
    :class="header.cls"
    style="position: relative; width: 100%; overflow: hidden"
  >
    <Nav />

    <!-- 首页 full -->
    <div v-if="headerType === 'home'" class="h-full">
      <Images />
      <Brand />
    </div>

    <!-- 文章 cover：从 articleStore 读数据，动态封面 + 左对齐 -->
    <div
      v-if="headerType === 'article'"
      class="h-article"
      :style="
        articleCover ? `background-image: url('${articleCover}')` : undefined
      "
    >
      <ArticleHeader
        v-if="!articleLoading && articleVO.id"
        :article="articleVO"
        :wordCount="countMd"
      />
    </div>

    <!-- 通用 banner -->
    <div
      v-if="headerType === 'page'"
      class="h-banner"
      :title="title"
      :subtitle="subtitle"
    >
      <h2 class="title">{{ title }}</h2>
      <h3 class="subtitle">
        <span>{{ subtitle }}</span>
      </h3>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { storeToRefs } from "pinia";
import Nav from "@/components/Nav/index.vue";
import { canvasHeaderH } from "@/components/CanvasLayer/index.ts";
import Images from "@/components/Header/Images.vue";
import Brand from "@/components/Header/Brand.vue";
import ArticleHeader from "@/components/Article/ArticleHeader.vue";
import { useArticleStore } from "@/store/modules/article";

const articleStore = useArticleStore();
const {
  articleVO,
  countMd,
  loading: articleLoading,
  articleCover,
} = storeToRefs(articleStore);

interface HeaderConfig {
  cls: string;
  height: number;
}
const props = defineProps({
  headerType: { type: String, default: "page" },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
});

const windowH = window.innerHeight;
const header = computed<HeaderConfig>(() => {
  switch (props.headerType) {
    case "home":
      return { cls: "home-header", height: windowH };

    case "article":
      return { cls: "article-header", height: windowH * 0.2 };

    case "page":
      return { cls: "page-header", height: windowH * 0.5 };

    default:
      return { cls: "page-header", height: 0 };
  }
});

// 画布偏移：首页 hero 自有 Images 轮播背景 → 画布应从内容区开始（0偏移）
const canvasOffset = computed(() => windowH - header.value.height);

watch(
  () => canvasOffset.value,
  (h) => {
    canvasHeaderH.value = h;
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.home-header {
  height: 100vh;
}
.article-header {
  display: flex;
  justify-content: center;
  // padding: 3.5rem 1.5rem 0;
  transition: background-color 0.3s ease;
  
  background-color: var(--mao-background-color);
  height: 30vh;
}
.page-header {
  height: 50vh;
}

.h-article {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: flex-start;
  background-size: cover;
  background-position: center;
}

.h-banner {
  position: relative;
  height: 100%;
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  background-image: url("@/assets/images/forest.jpg");
  background-size: cover;
  background-position: center;

  .title {
    color: white;
    font-size: 4.6rem;
    font-weight: normal;
    text-shadow: 0 1px 0 hsl(174, 5%, 80%), 0 2px 0 hsl(174, 5%, 75%),
      0 3px 0 hsl(174, 5%, 70%), 0 4px 0 hsl(174, 5%, 66%),
      0 5px 0 hsl(174, 5%, 64%), 0 6px 0 hsl(174, 5%, 62%),
      0 7px 0 hsl(174, 5%, 61%), 0 8px 0 hsl(174, 5%, 60%),
      0 0 5px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.2),
      0 3px 5px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.2),
      0 10px 10px rgba(0, 0, 0, 0.2), 0 20px 20px rgba(0, 0, 0, 0.3);
  }

  $shadow: #533d4a;
  $red: #e55643;
  $green: #6ba988;
  $yellow: #f1c83c;
  $shadow: #533d4a;

  .subtitle {
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.6rem;
    letter-spacing: 5px;
    margin: 1rem 0 0 0;
    font-weight: normal;

    span {
      transform: skew(-10deg);
      display: block;
      float: left;
      text-shadow: $shadow 1px 1px, $shadow 2px 2px, $shadow 3px 3px,
        $shadow 4px 4px, $shadow 5px 5px, $shadow 6px 6px;
      min-width: 10px;
      min-height: 10px;
      position: relative;
    }
  }

  .subtitle {
    &:nth-child(1) {
      color: $red;
    }
    &:nth-child(2) {
      color: $green;
    }
    &:nth-child(3) {
      color: $yellow;
    }
  }
}
</style>
