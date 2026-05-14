<template>
  <div class="offline-search">
    <div class="search-bar">
      <el-input
        v-model="query"
        placeholder="搜索文章..."
        clearable
        @input="onInput"
        @keyup.enter="onInput"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 搜索历史（无查询时显示） -->
    <div v-if="!query" class="search-history">
      <div class="section-header">
        <span>搜索历史</span>
        <span v-if="history.length" class="clear-btn" @click="clearHistory">清除记录</span>
      </div>
      <div v-if="history.length" class="history-tags">
        <el-check-tag
          v-for="item in history"
          :key="item"
          checked
          style="margin: 4px"
          @click="searchFromHistory(item)"
        >
          {{ item }}
        </el-check-tag>
      </div>
      <div v-else class="empty-hint">暂无搜索历史</div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="query" class="search-results">
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>搜索中...</span>
      </div>

      <div v-else-if="pagefindError" class="error-state">
        离线搜索暂不可用，请稍后重试或刷新页面
      </div>

      <template v-else>
        <div
          v-for="item in results"
          :key="item.id"
          class="result-item"
          @click="goToArticle(item.id)"
        >
          <div class="result-title" v-html="item.title"></div>
          <div class="result-excerpt" v-html="item.excerpt"></div>
        </div>
        <div v-if="results.length === 0 && query" class="empty-state">
          未找到匹配的文章
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Search, Loading } from "@element-plus/icons-vue";
import { useLocalStorage } from "@vueuse/core";
import router from "@/router";

// ---------- 状态 ----------
const query = ref("");
const loading = ref(false);
const pagefindError = ref(false);

interface SearchResult {
  id: number;
  title: string;
  excerpt: string;
}
const results = ref<SearchResult[]>([]);

const history = useLocalStorage<string[]>("pfSearchHistory", []);

// Pagefind 模块引用（懒加载）
let pagefindModule: any = null;

// 防抖定时器
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// ---------- Pagefind 懒加载 ----------

/** 动态加载 Pagefind 前端库 */
async function ensurePagefind() {
  if (pagefindModule) return pagefindModule;
  try {
    if (import.meta.env.DEV) {
      // 开发模式：pagefind 在 src/pagefind/，Vite 可直接解析
      pagefindModule = await import("@/pagefind/pagefind.js");
    } else {
      // 生产模式：pagefind 在 dist/pagefind/，通过 fetch 加载
      const resp = await fetch("/pagefind/pagefind.js");
      const text = await resp.text();
      const blobUrl = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
      pagefindModule = await import(/* @vite-ignore */ blobUrl);
    }
    return pagefindModule;
  } catch (e) {
    console.error("Pagefind 加载失败:", e);
    pagefindError.value = true;
    throw e;
  }
}

// ---------- 搜索逻辑 ----------

function onInput() {
  const q = query.value.trim();
  if (!q) {
    results.value = [];
    return;
  }

  // 防抖：300ms 后执行搜索
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => doSearch(q), 300);
}

async function doSearch(q: string) {
  loading.value = true;
  pagefindError.value = false;

  try {
    const pf = await ensurePagefind();
    const searchResult = await pf.search(q);

    if (query.value.trim() !== q) {
      // 用户已经输入了新内容，丢弃本次结果
      loading.value = false;
      return;
    }

    const rawResults = searchResult.results || [];
    const items = await Promise.all(
      rawResults.map(async (r: any) => {
        const data = await r.data();
        // 从 url "/article/1" 提取 id
        const id = Number(data.url?.split("/").pop()) || 0;
        return {
          id,
          title: data.meta?.title || "",
          // excerpt 自带 Pagefind 的 <mark> 标签
          excerpt: data.excerpt || "",
        };
      })
    );
    results.value = items;
  } catch (e) {
    console.error("Pagefind 搜索失败:", e);
    pagefindError.value = true;
  } finally {
    loading.value = false;
  }
}

// ---------- 历史记录 ----------

function searchFromHistory(keyword: string) {
  query.value = keyword;
  onInput();
}

function clearHistory() {
  history.value = [];
}

// ---------- 导航 ----------

function goToArticle(id: number) {
  // 记录搜索历史
  if (query.value && !history.value.includes(query.value)) {
    history.value.push(query.value);
  }
  router.push(`/article/${id}`);
}
</script>

<style scoped lang="scss">
.offline-search {
  margin-top: 16px;
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  // ---- 搜索历史 ----
  .search-history {
    margin-top: 12px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      padding: 8px 0;

      .clear-btn {
        font-weight: 400;
        font-size: 12px;
        color: #999;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }
    }

    .history-tags {
      display: flex;
      flex-wrap: wrap;
    }

    .empty-hint {
      font-size: 12px;
      color: #bbb;
      text-align: center;
      padding: 12px 0;
    }
  }

  // ---- 搜索结果 ----
  .search-results {
    margin-top: 12px;
    max-height: 400px;
    overflow-y: auto;

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 24px 0;
      color: #999;
      font-size: 14px;
    }

    .result-item {
      padding: 10px 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f7fa;
      }

      .result-title {
        font-size: 15px;
        font-weight: 500;
        line-height: 1.4;
      }

      .result-excerpt {
        margin-top: 4px;
        font-size: 13px;
        color: #666;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-clamp: 2;
        overflow: hidden;
      }
    }

    .empty-state {
      text-align: center;
      padding: 24px 0;
      font-size: 13px;
      color: #bbb;
    }

    .error-state {
      text-align: center;
      padding: 16px 0;
      font-size: 13px;
      color: var(--el-color-danger);
    }
  }
}

// Pagefind 关键词高亮样式
:deep(mark) {
  background-color: #fef08a;
  border-radius: 3px;
  padding: 0 2px;
}
</style>
