<template>
  <div>
    <!-- 尾部标签与点赞收藏分享 -->
    <div style="display: flex; justify-content: space-between">
      <div v-if="showTag" class="tag">
        <template v-for="tag in article.tags" :key="tag.id">
          <div @click="router.push(`/tags/${tag.id}`)"># {{ tag.tagName }}</div>
        </template>
      </div>
      <div v-if="showLikFav" class="like">
        <div @click="handleLike">
          <SvgIcon v-show="!liked" name="like" />
          <SvgIcon v-show="liked" name="like-selected" />
          <span>{{ article.likeCount }}</span>
        </div>
        <div @click="handleCollection">
          <SvgIcon v-show="!collected" name="collection" />
          <SvgIcon v-show="collected" name="collection-selected" />
          <span>{{ article.favoriteCount }}</span>
        </div>
        <div @click="copyToClipboard">
          <SvgIcon name="share" />
          <span>分享</span>
        </div>
      </div>
    </div>

    <!-- 分类标签 -->
    <div v-if="showTag">
      <div class="tag" style="display: flex; justify-content: left">
        <div @click="router.push(`/category/${article.categoryId}`)">
          {{ article.categoryName }}
        </div>
      </div>
    </div>

    <!-- 打赏 -->
    <div class="tipping">
      <el-tooltip class="box-item" effect="light" placement="top">
        <template #content>
          <div class="qrCode">
            <div>
              支付宝
              <el-image :src="payQr" />
            </div>
          </div>
        </template>
        <div>
          <svg-icon name="gift" />
          <span class="max-[540px]:hidden">ヾ(≧▽≦*)o！</span>
        </div>
      </el-tooltip>
    </div>

    <!-- 上/下 篇文章 -->
    <div class="goOn">
      <div>
        <div v-if="article.preArticleId > 0">
          <el-link @click="router.push(`/article/${article.preArticleId}`)">
            上一篇：{{ article.preArticleTitle }}
          </el-link>
        </div>
      </div>
      <div>
        <div v-if="article.nextArticleId > 0">
          <el-link @click="router.push(`/article/${article.nextArticleId}`)">
            下一篇：{{ article.nextArticleTitle }}
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useServiceStore } from "@/store/modules/service";
import { cancelFavorite, userFavorite, isFavorite } from "@/apis/favorite";
import { cancelLike, isLike, userLike } from "@/apis/like";
import type { ArticleVO } from "@/types";
import payQr from "@/assets/pay/a77178025b790601a8a0a8361718b148.png";

const props = defineProps<{
  article: ArticleVO;
}>();

const router = useRouter();
const route = useRoute();
const useService = useServiceStore();
const env = import.meta.env;

// ── 显隐控制：服务可用时展示交互区 ──
const showTag = computed(() => !!props.article.tags?.length);
const showLikFav = computed(() => useService.isServiceAvailable);

// ── 点赞/收藏状态 ──
const liked = ref(false);
const collected = ref(false);

// 文章切换时重置状态并重新查询
watch(
  () => props.article.id,
  async () => {
    if (!useService.isServiceAvailable) return;
    liked.value = false;
    collected.value = false;
    await Promise.all([queryIsLike(), queryIsFavorite()]);
  },
  { immediate: true }
);

async function queryIsLike() {
  const res: any = await isLike(1, props.article.id.toString());
  liked.value = res.code === 200;
}

async function queryIsFavorite() {
  const res: any = await isFavorite(1, props.article.id.toString());
  collected.value = res.data === true;
}

async function handleLike() {
  if (liked.value) {
    const res: any = await cancelLike(1, props.article.id.toString());
    if (res.code === 200) {
      props.article.likeCount -= 1;
      liked.value = false;
      ElMessage.info("我会继续努力的");
    } else {
      ElMessage.error(res.msg);
    }
  } else {
    const res: any = await userLike(1, props.article.id.toString());
    if (res.code === 200) {
      props.article.likeCount += 1;
      liked.value = true;
      ElMessage.success("感谢你的认可");
    } else {
      ElMessage.error(res.msg);
    }
  }
}

async function handleCollection() {
  if (collected.value) {
    const res: any = await cancelFavorite(1, props.article.id.toString());
    if (res.code === 200) {
      props.article.favoriteCount -= 1;
      collected.value = false;
      ElMessage.info("取消收藏");
    } else {
      ElMessage.error(res.msg);
    }
  } else {
    const res: any = await userFavorite(1, props.article.id.toString());
    if (res.code === 200) {
      props.article.favoriteCount += 1;
      collected.value = true;
      ElMessage.success("收藏成功");
    } else {
      ElMessage.error(res.msg);
    }
  }
}

async function copyToClipboard() {
  try {
    const content = `欢迎访问博客文章：${props.article.articleTitle} \n通往地址：${env.VITE_FRONTEND_URL}${route.path}`;
    await navigator.clipboard.writeText(content);
    ElMessage.success("已复制分享链接");
  } catch (error) {
    ElMessage.error("复制失败，请联系网站管理员");
  }
}
</script>

<style scoped lang="scss">
@use "@/styles/mixin" as *;

// 文章底部标签
.tag {
  font-size: 0.8em;
  display: flex;
  flex-wrap: wrap;

  div {
    margin: 0.5rem 0.5rem;
    padding: 0.5rem 0.9rem;
    // border: 1px solid var(--el-border-color);
    border-radius: 5px;
    background-color: var(--mao-background-color);

    @media screen and (max-width: 450px) {
      padding: 0.25rem;
    }

    &:hover {
      background-color: var(--el-border-color);
      cursor: pointer;
    }
  }
}

.like {
  font-size: 0.8em;
  display: flex;
  flex-wrap: wrap;

  div {
    @include flex;
    margin: 0 0.5rem;
    padding: 0.5rem 0.9rem;
    border-radius: 5px;
    background-color: var(--el-background-color);

    @media screen and (max-width: 450px) {
      height: 3em;
      padding: 0.1rem 0.2rem;
      margin: 0 0.1rem;
    }

    span {
      margin-left: 0.5em;
    }

    &:hover {
      background-color: var(--el-border-color);
      cursor: pointer;
    }
  }
}

.tipping {
  @include flex;
  width: 100%;
  text-align: center;
  font-size: 0.86em;
  font-weight: bold;
  cursor: pointer;

  div {
    @include flex;
    color: white;
    background-color: #c0a46b;
    width: 20%;
    border: 1px solid var(--el-border-color);
    height: 2.5em;
    border-radius: 5px;

    span {
      margin-left: 0.6em;
    }

    &:hover {
      background-color: #fc7444;
    }
  }
}

// 打赏二维码
.qrCode {
  @include flex;
  align-items: center;
  width: 100%;
  height: 100%;

  div {
    @include flex;
    flex-direction: column-reverse;
    margin: 0 0.5rem;
  }

  .el-image {
    width: 9em;
    height: 9em;
  }
}

.goOn {
  @include flex;
  justify-content: space-between;
  margin: 1rem 0;

  div {
    @include flex;
    align-items: center;
    color: var(--el-text-color-secondary);
    cursor: pointer;

    div {
      .el-link {
        font-size: 0.6em;
      }
    }
  }
}
</style>
