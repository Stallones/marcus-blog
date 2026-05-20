<template>
  <div
    class="offline-search"
    :class="{ 'is-collapsed': collapsed, 'is-expanded': !collapsed }"
    @click="handleExpand"
  >
    <!-- 折叠状态：与公告栏风格一致 -->
    <div v-if="collapsed" class="collapsed-view">
      <el-icon size="20"><Search /></el-icon>
      <span>搜索文章...</span>
    </div>

    <!-- 展开状态 -->
    <template v-else>
      <!-- 内部所有点击不冒泡到外层 handleExpand -->
      <div @click.stop>
        <div class="search-bar">
          <el-input
            v-model="query"
            ref="inputRef"
            placeholder="搜索文章..."
            clearable
            @input="onInput"
            @keyup.enter="onInput"
            @focus="handleFocus"
            @blur="handleBlur"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 搜索历史（聚焦时滑入） -->
        <div v-if="!query && focused" v-slide-in class="search-history">
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
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { Search, Loading } from "@element-plus/icons-vue";
import { useLocalStorage } from "@vueuse/core";
import router from "@/router";

// ---------- 状态 ----------
const collapsed = ref(true);
const query = ref("");
const loading = ref(false);
const pagefindError = ref(false);
const focused = ref(false);

const inputRef = ref<any>(null);

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
let blurTimer: ReturnType<typeof setTimeout> | null = null;

// ---------- 展开/折叠 ----------
function handleExpand() {
  if (!collapsed.value) return;
  collapsed.value = false;
  nextTick(() => {
    focused.value = true;
    // 自动聚焦输入框
    const input = inputRef.value?.$el?.querySelector('input');
    input?.focus();
  });
}

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
  // 取消 blur 延迟，防止折叠干扰导航
  if (blurTimer) clearTimeout(blurTimer);

  // 记录搜索历史
  if (query.value && !history.value.includes(query.value)) {
    history.value.push(query.value);
  }
  router.push(`/article/${id}`);
}

// ---------- 聚焦 ----------
function handleFocus() {
  focused.value = true;
}

function handleBlur() {
  blurTimer = setTimeout(() => {
    focused.value = false;
    // 搜索框为空时自动折叠回原始状态
    if (!query.value.trim()) {
      collapsed.value = true;
    }
    blurTimer = null;
  }, 200);
}
</script>

<style scoped lang="scss">
.offline-search {
  margin-top: 10px;
  border: 1px dotted #ccc;
  border-radius: 15px;
  min-height: 50px;
  transition: all 0.5s ease;

  // ---- 折叠状态：与公告栏风格一致 ----
  &.is-collapsed {
    padding: 10px;
    background: transparent;
    box-shadow: none;
    cursor: pointer;

    &:hover {
      border-color: #409eff;
    }

    .collapsed-view {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;

      .el-icon {
        min-width: 20px;
      }

      span {
        text-align: center;
        white-space: nowrap;
        color: #999;
        font-size: 14px;
      }
    }
  }

  // ---- 展开状态 ----
  &.is-expanded {
    position: relative;
    padding: 16px 16px 0;  // 无底部 padding，下拉区无缝衔接
    background: var(--el-bg-color);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    z-index: 50;

    // 去掉容器底部边框和底部圆角，由下拉区域继承
    border-bottom: none;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    // 搜索框
    .search-bar {
      :deep(.el-input__wrapper) {
        box-shadow: none !important;
        background: var(--secondary-bg);
        border-radius: 0.6em;
        transition: background-color 0.2s;

        &.is-focus {
          background: var(--el-fill-color, rgba(0, 0, 0, 0.04));
        }
      }

      :deep(.el-input__inner) {
        background: transparent;
      }
    }


    // 下拉区域（历史/结果）共用绝对定位
    .search-history,
    .search-results {
      position: absolute;
      top: 100%;
      left: -1px;
      right: -1px;
      z-index: 100;
      background: var(--el-bg-color);
      border: 1px dotted #ccc;
      border-top: none;
      border-radius: 0 0 15px 15px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      max-height: 400px;
      overflow-y: auto;
      padding: 0 16px 12px;
      margin-top: 0;
    }

    // 下拉内搜索历史/结果的独立间距
    .search-history {
      .section-header {
        padding: 12px 0 8px;
      }
    }

    .search-results {
      .result-item:first-child {
        margin-top: 8px;
      }
    }
  }

  // ---- 搜索历史 ----
  .search-history {
    margin-top: 12px;
    overflow: hidden;

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
