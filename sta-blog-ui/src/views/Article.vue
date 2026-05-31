<template>
  <!-- 正常模式 -->
  <div v-if="!isReadingMode">
    <div class="progress"></div>
    <div class="p-1">
      <ArticleBody
        :content="articleVO.articleContent"
        :editorId="id"
        :theme="mode"
        @htmlChanged="mdHtml"
      />
      <ArticleFooter :article="articleVO" />
      <ArticleOthers :article="articleVO" />
      <!-- 用户评论 -->
      <Comment
        v-if="showComment"
        :serverOn="useService.isServiceAvailable"
        :authorId="articleVO.userId"
        :commentType="COMMENT_ARTICLE_CONS"
        :commentPId="articleVO.id"
        :liketype="2"
      />
    </div>
  </div>

  <!-- 阅读模式 -->
  <div v-if="isReadingMode" class="bg-white dark:bg-gray-800">
    <div
      @click="isReadingMode = false"
      class="z-10 w-[50px] h-[50px] bg-gray-200 hover:bg-gray-300 fixed top-[2em] right-[1em] lg:right-[5em] rounded flex items-center justify-center duration-300 cursor-pointer"
    >
      <svg-icon name="exit_icon" style="width: 25px; height: 25px" />
    </div>
    <div
      class="sm:px-1 md:px-[5rem] lg:px-[10rem] xl:px-[15rem] py-3"
      style="transition: all 0.5s ease"
    >
      <ArticleBody
        :content="articleVO.articleContent"
        :editorId="id"
        :theme="mode"
        @htmlChanged="mdHtml"
      />
      <ArticleFooter :article="articleVO" />
    </div>
  </div>

  <MobileDirectoryCard
    :id="id"
    :scroll-element="scrollElement"
    :is-show-move-catalog="isShowMoveCatalog"
    @update:isShowMoveCatalog="(value) => (isShowMoveCatalog = value)"
  />
  <div v-show="!isReadingMode">
    <el-affix position="bottom" :offset="200">
      <el-tooltip effect="light" content="显示目录" placement="right">
        <div class="move_catalog_btn" @click="isShowMoveCatalog = true">
          <svg-icon
            name="directory"
            class="move_catalog_svg"
            width="30"
            height="30"
          />
        </div>
      </el-tooltip>
    </el-affix>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useColorMode } from "@vueuse/core";
import { storeToRefs } from "pinia";

import { useServiceStore } from "@/store/modules/service";
import { useArticleStore } from "@/store/modules/article";
import { throttle } from "@/utils/optimize.ts";
import { COMMENT_ARTICLE_CONS } from "@/const";

import ArticleBody from "@/components/Article/ArticleBody.vue";
import ArticleFooter from "@/components/Article/ArticleFooter.vue";
import ArticleOthers from "@/components/Article/ArticleOthers.vue";
import { isReadingMode } from "@/components/Article/readingMode";
import { useBottomRightState } from "@/components/BottomRight/bottomRightState";

import MobileDirectoryCard from "@/views/Article/MobileDirectoryCard.vue";

// ── Store ──
const route = useRoute();
const useService = useServiceStore();
const articleStore = useArticleStore();
const { articleVO } = storeToRefs(articleStore);

// ── BottomRight：注册文章页独有功能项 ──
const { registerItem, unregisterItem } = useBottomRightState();

onMounted(async () => {
  // 注册文章页独有功能项
  registerItem({ id: "readingMode", global: false, order: 10 });
  registerItem({ id: "toComment", global: false, order: 20 });

  await getArticleDetailById();
});

onUnmounted(() => {
  unregisterItem("readingMode");
  unregisterItem("toComment");
});

// ── 基础依赖 ──
const colorMode = useColorMode();
const mode = computed(() =>
  colorMode.value === "auto" ? "light" : colorMode.value
);

// ── 文章数据（从 store 读） ──
const id = "preview-only";
const scrollElement = document.documentElement;

// ── 功能显隐 ──
const showComment = ref(false);

// ── 路由切换重新获取 ──
watch(
  () => route.params.id,
  () => {
    getArticleDetailById();
  }
);

async function getArticleDetailById() {
  await articleStore.fetchArticle(route.params.id as string);

  // 服务可用时展示交互功能区
  if (useService.isServiceAvailable) {
    showComment.value = true;
  }
}

// ── 字数统计回调（ArticleBody emit）→ 写回 store ──
function mdHtml(htmlText: string) {
  const text = htmlText
    .replace(/<[^>]+>/g, "")
    .replace(/[\r\n]/g, "")
    .replace(/[ ]/g, "")
    .replace(/[\s+\.\!\/_,$%^*(+\"\']+|[+——！，。？、~@#￥%……&*（）]+/g, "");
  articleStore.setWordCount(text.length);
}

// ── 顶部进度条（阅读进度） ──
const throttledScroll = throttle(() => {
  window.requestAnimationFrame(scrollWork);
}, 40);

window.addEventListener("scroll", throttledScroll);

function scrollWork() {
  const pageHeight =
    document.documentElement.scrollHeight || document.body.scrollHeight;
  const screenHeight =
    document.documentElement.clientHeight || document.body.clientHeight;
  const scrollHeight = pageHeight - screenHeight;
  const scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop;

  const progress: HTMLElement | null = document.querySelector(".progress");
  if (progress) {
    progress.style.width = (scrollTop / scrollHeight) * 100 + "%";
  }
}

// ── 移动端目录 ──
const isShowMoveCatalog = ref(false);
</script>

<style scoped lang="scss">
@use "@/styles/mixin" as *;

// 移动端目录按钮
.move_catalog_btn {
  border-radius: 1em;
  box-shadow: var(--el-box-shadow-light);
  border: 1px solid var(--el-border-color);
  background: white;
  position: fixed;
  right: 5em;
  bottom: 1em;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  visibility: hidden;

  @media screen and (max-width: 910px) {
    visibility: visible;
    right: 3em;
    bottom: 1em;
  }

  @media screen and (max-width: 768px) {
    right: 5em;
    bottom: 1em;
  }

  .move_catalog_svg {
    @media screen and (max-width: 768px) {
      width: 25px !important;
      height: 25px !important;
    }
  }
}

::deep(.el-drawer__header) {
  margin-bottom: 0;
}

.progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background: var(--mao-scroll-percentage-bar);
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  z-index: 11;
}

.p-1 {
  /* 外层 main-content 已提供 padding，此处不再重复 */
}

.pre-text {
  text-align: left;
  overflow: auto;
}
</style>
