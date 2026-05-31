// src/store/modules/article.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useTitle } from "@vueuse/core";
import { ElMessage } from "element-plus";
import router from "@/router";
import { addArticleVisit, getArticleDetail } from "@/apis/article";
import { readArticleDetail } from "@/utils/file-reader";
import { useServiceStore } from "./service";
import { ARTICLE_VISIT_PREFIX } from "@/const";
import type { ArticleVO } from "@/types";

export const useArticleStore = defineStore("article", () => {
  // ── State ──
  const articleVO = ref<ArticleVO>({} as ArticleVO);
  const countMd = ref<string | number>(0);
  const loading = ref(false);

  const route = useRoute();

  // ── Computed ──
  /** 动态封面 URL（供 Header .h-article 使用） */
  const articleCover = computed(() => articleVO.value.articleCover ?? "");

  // ── Actions ──
  async function fetchArticle(id?: string) {
    const articleId = (id || route.params.id) as string;
    if (!articleId) return;

    loading.value = true;
    const useService = useServiceStore();

    try {
      const res = await useService.requestOrRead(
        getArticleDetail,
        readArticleDetail,
        articleId
      );

      if (res.code !== 200) {
        ElMessage.warning({ message: res.msg });
        router.push({ path: "/" });
        return;
      }

      articleVO.value = res.data as ArticleVO;
      useTitle(articleVO.value.articleTitle);

      // 时间去掉时分秒
      articleVO.value.createTime = articleVO.value.createTime?.split(" ")[0];
      articleVO.value.updateTime = articleVO.value.updateTime?.split(" ")[0];

      // 访问统计
      if (
        !sessionStorage.getItem(ARTICLE_VISIT_PREFIX + articleId) &&
        useService.isServiceAvailable
      ) {
        sessionStorage.setItem(ARTICLE_VISIT_PREFIX + articleId, articleId);
        addArticleVisit(articleId);
      }
    } finally {
      loading.value = false;
    }
  }

  /** 设置字数统计（由 ArticleBody 回调触发） */
  function setWordCount(count: number) {
    countMd.value =
      count <= 1000 ? count : Number((count / 1000).toFixed(1)) + "k";
  }

  /** 重置文章数据 */
  function resetArticle() {
    articleVO.value = {} as ArticleVO;
    countMd.value = 0;
  }

  return {
    articleVO,
    countMd,
    loading,
    articleCover,
    fetchArticle,
    setWordCount,
    resetArticle,
  };
});
