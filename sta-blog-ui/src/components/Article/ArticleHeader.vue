<template>
  <div class="article-header-text">
    <div class="classify">
      <div>{{ article.categoryName }}</div>
      <div class="tag" v-for="tag in article.tags" :key="tag.id">
        # {{ tag.tagName }}
      </div>
    </div>
    <div class="title">{{ article.articleTitle }}</div>
    <div class="statistics">
      <div>字数统计:{{ wordCount }}</div>
    </div>
    <div class="statistics">
      <div>访问量:{{ article.visitCount }}</div>
      <div>评论数:{{ article.commentCount }}</div>
      <div>点赞量:{{ article.likeCount }}</div>
      <div>收藏量:{{ article.favoriteCount }}</div>
    </div>
    <div class="time">
      <div>发布：{{ article.createTime }}</div>
      <div>更新：{{ article.updateTime }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ArticleVO } from "@/types";

defineProps<{
  article: ArticleVO;
  wordCount?: string | number;
}>();
</script>

<style scoped lang="scss">
@use "@/styles/mixin" as *;

.article-header-text {
  // display: flex;
  // flex-direction: column;
  // align-items: self-start;
  color: var(--mao-background-color);
  font-size: 15px;
  padding: 0% 10vw;
  width: 100%;

  .tag {
    background-color: rgba(255, 255, 255, 0);
  }

  div div {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 5px;
    margin: 5px;
    padding: 5px;
  }

  div {
    display: flex;
  }

  .title {
    font-size: 40px;
    margin: 10px 0;
  }
}
</style>
