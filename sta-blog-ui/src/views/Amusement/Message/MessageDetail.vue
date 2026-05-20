<script setup lang="ts">
import { ArrowLeftBold } from "@element-plus/icons-vue";
import { getLeaveWordList } from "@/apis/leaveWord";
import { MdPreview } from "md-editor-v3";
import { cancelLike, isLike, userLike } from "@/apis/like";
import { ElMessage } from "element-plus";
import { cancelFavorite, isFavorite, userFavorite } from "@/apis/favorite";
import { useColorMode } from "@vueuse/core";
import { useRoute } from "vue-router";
import { COMMENT_MESSAGE_CONS } from "@/const";

import Comment from "@/components/Comment/index.vue";

const mode = useColorMode();
const leaveWord = ref<any>({});
const route = useRoute();
const loadingComment = ref(false);
const like = ref(false);
const favorite = ref(false);

onMounted(() => {
  getLeaveWord();
});

async function getLeaveWord() {
  const res: any = await getLeaveWordList(route.params.id);
  leaveWord.value = res.data[0] || {};
  loadingComment.value = true;
  isLikeFunc();
  isFavoriteFunc();
}

async function isLikeFunc() {
  const res: any = await isLike(3, leaveWord.value.id);
  like.value = res.code === 200;
}

function likeFunc() {
  if (like.value) {
    cancelLikeFunc();
  } else {
    userLikeFunc();
  }
}

async function userLikeFunc() {
  if (like.value) {
    return;
  }
  const res: any = await userLike(3, leaveWord.value.id);
  if (res.code === 200) {
    leaveWord.value.likeCount++;
    like.value = true;
    ElMessage.success("点赞成功");
  } else {
    like.value = false;
    ElMessage.warning(res.msg);
  }
}

async function cancelLikeFunc() {
  if (!like.value) {
    return;
  }
  const res: any = await cancelLike(3, leaveWord.value.id);
  if (res.code === 200) {
    leaveWord.value.likeCount--;
    like.value = false;
  } else {
    like.value = true;
    ElMessage.warning(res.msg);
  }
}

async function isFavoriteFunc() {
  const res: any = await isFavorite(2, leaveWord.value.id);
  favorite.value = res.data === true;
}

function favoriteFunc() {
  if (favorite.value) {
    cancelFavoriteFunc();
  } else {
    userFavoriteFunc();
  }
}

async function userFavoriteFunc() {
  if (favorite.value) {
    return;
  }
  const res: any = await userFavorite(2, leaveWord.value.id);
  if (res.code === 200) {
    leaveWord.value.favoriteCount++;
    favorite.value = true;
    ElMessage.success("收藏成功");
  } else {
    favorite.value = false;
    ElMessage.warning(res.msg);
  }
}

async function cancelFavoriteFunc() {
  if (!favorite.value) {
    return;
  }
  const res: any = await cancelFavorite(2, leaveWord.value.id);
  if (res.code === 200) {
    leaveWord.value.favoriteCount--;
    favorite.value = false;
  } else {
    favorite.value = true;
    ElMessage.warning(res.msg);
  }
}
</script>

<template>
  <div>
    <div>
      <el-link :icon="ArrowLeftBold" @click="$router.push('/message')"
        >回到留言列表</el-link
      >
      <el-divider />
    </div>
    <div class="user">
      <span><el-avatar :src="leaveWord.avatar" /></span>
      <div class="detail">
        <span class="name">{{ leaveWord.nickname }}</span>
        <span class="time">{{ leaveWord.createTime }}</span>
      </div>
    </div>
    <div class="content">
      <MdPreview :modelValue="leaveWord.content" :theme="mode" />
    </div>
    <div class="container">
      <div class="count">
        <div>
          <SvgIcon name="comments" />
          <span>{{ leaveWord.commentCount }}</span>
        </div>
        <div @click="likeFunc">
          <SvgIcon v-show="!like" name="like" />
          <SvgIcon v-show="like" name="like-selected" />
          <span>{{ leaveWord.likeCount }}</span>
        </div>
        <div @click="favoriteFunc">
          <SvgIcon v-show="!favorite" name="collection" />
          <SvgIcon v-show="favorite" name="collection-selected" />
          <span>{{ leaveWord.favoriteCount }}</span>
        </div>
      </div>
    </div>
    <el-divider content-position="left" />
    <!-- 用户评论 -->
    <Comment
      :authorId="leaveWord.userId"
      :commentType="COMMENT_MESSAGE_CONS"
      :commentPId="leaveWord.id"
      :likeType="2"
      :isShowHeader="true"
      v-if="loadingComment"
    />
  </div>
</template>

<style scoped lang="scss">
.comments {
  border-radius: $border-radius;

  .comment {
    .comment_content {
      padding: 1rem;
      border-radius: $border-radius;
      font-size: 0.9em;

      .child_reply {
        margin-top: 1rem;
        background: white;
        padding: 1rem;
        border-radius: $border-radius;
        font-size: 0.9em;
      }
    }

    padding: 1rem 0;
  }
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
}

.content {
  margin: 1rem 0;
}

:deep(.md-editor-toolbar-left) {
  flex-wrap: wrap;
}

.count {
  display: flex;
  margin-top: 0.5rem;

  div {
    display: flex;
    align-items: center;
    margin-right: 1rem;
    color: grey;
  }

  span {
    margin-left: 0.2rem;
  }
}

.user {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  .detail {
    display: flex;
    flex-direction: column;
    margin-left: 0.2rem;
  }

  .name {
    font-size: 1em;
    margin-bottom: 0.5em;
    color: #0072ff;
  }

  .time {
    font-size: 0.75em;
    color: grey;
  }
}
</style>
