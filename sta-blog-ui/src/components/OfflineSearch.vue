<template>
  <div class="offline-search">
    <div class="search-input-wrap" :class="{ focused: isFocused }">
      <el-icon class="search-icon"><Search /></el-icon>
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        placeholder="搜索文章..."
        @input="onInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <el-icon
        v-if="query"
        class="clear-icon"
        @click="clearQuery"
      >
        <CircleClose />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { Search, CircleClose } from "@element-plus/icons-vue";
import { useSearchStore } from "@/store/modules/search";
import { searchLocalArticles } from "@/utils/file-reader";

const query = ref("");
const isFocused = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const searchStore = useSearchStore();

// Pagefind 懒加载
let pagefindModule: any = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

async function ensurePagefind() {
  if (pagefindModule) return pagefindModule;
  try {
    if (import.meta.env.DEV) {
      pagefindModule = await import("@/pagefind/pagefind.js");
    } else {
      const resp = await fetch("/pagefind/pagefind.js");
      const text = await resp.text();
      const blobUrl = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
      pagefindModule = await import(/* @vite-ignore */ blobUrl);
    }
    return pagefindModule;
  } catch (e) {
    console.error("Pagefind 加载失败:", e);
    throw e;
  }
}

// 输入处理
function onInput() {
  const q = query.value.trim();

  if (!q) {
    // 清空 → 恢复全量文章
    searchStore.clearSearch();
    return;
  }

  // 防抖搜索
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => doSearch(q), 300);
}

async function doSearch(q: string) {
  try {
    const pf = await ensurePagefind();
    const searchResult = await pf.search(q);

    // 输入已变更，丢弃旧结果
    if (query.value.trim() !== q) return;

    const rawResults = searchResult.results || [];
    const ids = await Promise.all(
      rawResults.map(async (r: any) => {
        const data = await r.data();
        return Number(data.url?.split("/").pop()) || 0;
      })
    );
    const validIds = ids.filter(Boolean);

    if (validIds.length) {
      const pageResult = await searchLocalArticles(validIds);
      if (query.value.trim() === q) {
        searchStore.setSearchResults(pageResult);
      }
    }
  } catch (e) {
    console.error("搜索失败:", e);
  }
}

function clearQuery() {
  query.value = "";
  searchStore.clearSearch();
  nextTick(() => {
    inputRef.value?.focus();
  });
}
</script>

<style scoped lang="scss">
.offline-search {
  // width: 100%; /* 冗余：block 元素自动撑满 */
  padding: 10px 0;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  // width: 100%; /* 冗余：flex 容器自动撑满父级 */
  height: 45px;
  padding: 0 12px;
  border-radius: 45px;
  background: var(--secondary-bg, #f1f3f5);
  border: 1px solid var(--border-color-light, #e9ecef);
  transition: all 0.2s ease;

  .search-icon {
    color: var(--text-secondary, #6c757d);
    font-size: 18px;
    margin-right: 10px;
    flex-shrink: 0;
    transition: color 0.2s;
  }

  input {
    flex: 1;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary, #212529);
    font-size: 14px;

    &::placeholder {
      color: var(--text-placeholder, #adb5bd);
    }
  }

  .clear-icon {
    color: var(--text-secondary, #6c757d);
    font-size: 16px;
    margin-left: 8px;
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
      color: var(--accent-color, #3b82f6);
    }
  }

  // 激活状态：内色加亮，边框蓝色高亮
  &.focused {
    background: var(--card-bg, #ffffff);
    border-color: var(--accent-color, #3b82f6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);

    .search-icon {
      color: var(--accent-color, #3b82f6);
    }
  }
}
</style>
