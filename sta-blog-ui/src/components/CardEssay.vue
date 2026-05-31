<script setup lang="ts">
import { getArticlePage } from "@/apis/home";
import { ElMessage } from "element-plus";
import usePaginationStore from "@/store/modules/pagination";
import { useWindowSize } from "@vueuse/core";
import { useServiceStore } from "@/store/modules/service";
import { useSearchStore } from "@/store/modules/search";
import { readArticlePage } from "@/utils/file-reader";
import { ArticleVO, Page } from "@/types";

// 屏幕宽度
const { width } = useWindowSize();
const usePagination = usePaginationStore();
const useService = useServiceStore();
const searchStore = useSearchStore();
const articlePagination = usePagination.articlePagination;


// 监听页数
watch(
  () => articlePagination.current,
  () => {
    // 搜索模式下不触发 API 请求
    if (searchStore.searchResults) return;
    getArticleListFunc();
    // 滚动到顶部
    window.scrollTo(0, 300);
  }
);

const cardList = ref<ArticleVO[]>([]);
const searchDisplayLimit = ref(10);

// 监听搜索 store → 有搜索结果时直接渲染（首次展示 10 条）
watch(
  () => searchStore.searchResults,
  (results) => {
    if (results) {
      searchDisplayLimit.value = 10;
      cardList.value = results.page.slice(0, 10);
      articlePagination.total = results.total;
    } else {
      // 搜索被清除 → 重新加载全量文章
      searchDisplayLimit.value = 10;
      articlePagination.current = 1;
      getArticleListFunc();
    }
  }
);

async function getArticleListFunc() {
  // 搜索模式下使用搜索 store 的数据，不调 API
  if (searchStore.searchResults) {
    cardList.value = searchStore.searchResults.page.slice(0, searchDisplayLimit.value);
    articlePagination.total = searchStore.searchResults.total;
    return;
  }

  const res = await useService.requestOrRead(
    getArticlePage,
    readArticlePage,
    articlePagination.current,
    articlePagination.pageSize
  );

  if (res.code === 200) {
    const pageResult = res.data as Page<ArticleVO>;
    articlePagination.total = pageResult.total;
    // 统一标签格式 & 过滤内容
    pageResult.page.forEach((item: ArticleVO) => {
      // 后端 tags 可能返回 string[]，统一转为 {id, tagName}[]
      if (item.tags && item.tags.length > 0 && typeof item.tags[0] === 'string') {
        item.tags = (item.tags as unknown as string[]).map((name, idx) => ({
          id: idx,
          tagName: name,
        })) as any;
      }
      if (item.articleContent) {
        item.articleContent = item.articleContent
          .replace(/[*#>`~\-\\[\\]()\\s]|(\\n\\n)/g, "")
          .substring(0, 60) + "...";
      }
    });
    cardList.value = pageResult.page;
  } else {
    ElMessage.error(res.msg);
  }
}
function loadContent() {
  getArticleListFunc();
}

function showMoreResults() {
  if (!searchStore.searchResults) return;
  searchDisplayLimit.value = searchStore.searchResults.total;
  cardList.value = searchStore.searchResults.page.slice(0, searchDisplayLimit.value);
}
</script>

<template>
  <!-- 封装文章列表卡片 -->
  <div v-view-request="{ callback: loadContent }">
    <template
      v-for="(article, index) in cardList"
      :key="article.id"
      v-if="cardList.length > 0"
    >
      <div
        v-slide-in
        @click="$router.push('/article/' + article.id)"
        class="h-92 md:h-60 mt-4 flex flex-col md:flex-row card overflow-hidden shadow-md mb-5 mx-2"
      >
        <div
          class="w-full md:h-full md:w-1/2 h-40"
          v-if="index % 2 == 1 || width < 768"
        >
          <div class="relative w-full h-full">
            <div class="relative img w-full h-full">
              <img
                class="w-full h-full object-cover hover:scale-110 ease-linear duration-300"
                v-lazy="true"
                :data-src="article.articleCover"
                alt="文章封面"
              />
            </div>
            <div
              class="classify text-white text-xs p-1.5 w-11 absolute top-0 left-0 rounded-br-lg"
            >
              {{ article.categoryName }}
            </div>
          </div>
        </div>
        <div class="md:w-1/2 w-full m-1 px-2 flex flex-col pl-5 pt-2 leading-7">
          <div class="hover:text-[#409EFF] text-2xl font-bold w-fit">
            {{ article.articleTitle }}
          </div>
          <div class="flex text-xs mt-2 space-x-2">
            <div class="flex">
              <SvgIcon name="reading" />
              <span class="ml-1">{{ article.visitCount }}</span>
            </div>
            <div class="flex">
              <SvgIcon name="comments" />
              <span class="ml-1">{{ article.commentCount }}</span>
            </div>
            <div class="flex">
              <SvgIcon name="like" />
              <span class="ml-1">{{ article.likeCount }}</span>
            </div>
            <div class="flex">
              <SvgIcon name="collection" />
              <span class="ml-1">{{ article.favoriteCount }}</span>
            </div>
          </div>
          <p
            class="overflow-ellipsis overflow-hidden h-10 md:h-[3.9rem] leading-tight mt-2 text-[#475569]"
          >
            {{ article.articleContent }}
          </p>
          <div class="flex space-x-2">
            <div class="tag">
              <span>标签：</span>
              <el-tag size="small" class="mr-2" v-for="tag in article.tags">{{
                tag.tagName
              }}</el-tag>
            </div>
          </div>
          <div class="text-xs mt-4 flex">
            <p class="mr-4 mb-1">发布于：{{ article.createTime }}</p>
            <p>更新于：{{ article.updateTime }}</p>
          </div>
        </div>
        <div
          class="w-full md:h-full md:w-1/2 h-40"
          v-if="index % 2 == 0 && width > 768"
        >
          <div class="relative w-full h-full">
            <div class="relative img w-full h-full">
              <img
                class="w-full h-full object-cover"
                v-lazy="true"
                :data-src="article.articleCover"
                alt="文章封面"
              />
            </div>
            <div
              class="classify text-white text-xs p-1.5 w-11 absolute top-0 left-0 rounded-br-lg"
            >
              {{ article.categoryName }}
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- 搜索模式下超 10 条时显示"展开"按钮 -->
    <div
      v-if="searchStore.searchResults && searchStore.searchResults.total > searchDisplayLimit"
      class="show-more-wrap"
    >
      <el-button type="primary" plain @click="showMoreResults">
        显示更多结果（共 {{ searchStore.searchResults.total }} 篇）
      </el-button>
    </div>
  </div>
  <template v-if="cardList.length == 0">
    <el-skeleton :rows="8" animated />
  </template>
</template>

<style scoped lang="scss">
.card {
  border-radius: $border-radius;
  // border: 1px solid #30363d;
  background-color: var(--el-bg-color);

  &:hover img {
    transform: scale(1.1);
  }

  .img {
    position: relative;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s linear;
    }
  }
}

.show-more-wrap {
  text-align: center;
  padding: 12px 0;
}

.classify {
  z-index: 1;
  position: absolute;
  top: 0;
  color: white;
  padding: 10px;
  backdrop-filter: blur(5px);
}
</style>
