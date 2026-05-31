<template>
  <!-- 搜索弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    :show-close="false"
    :close-on-click-modal="false"
    :lock-scroll="true"
  >
    <template #header>
      <div style="display: flex;justify-content: space-between;align-items: center">
        <span style="font-size: 1.2rem">搜索</span>
        <el-button :icon="Close" style="background: none;font-size: 1.5rem;width: 30px;border: none"
                   @click="dialogVisible = false"/>
      </div>
    </template>
    <Search @isShowSearch="dialogVisible = false"/>
  </el-dialog>

  <!-- 搜索按钮 -->
  <div v-if="isServiceAvailable" class="search-btn" @click="dialogVisible = true">
    <SvgIcon name="search" width="30" height="30" color="#409EFF" class="icon"/>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Close } from '@element-plus/icons-vue'

defineProps<{ isServiceAvailable: boolean }>()

const dialogVisible = ref(false)
</script>

<style scoped lang="scss">
.search-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  transition: transform 0.3s linear;
  cursor: pointer;
  &:hover { transform: scale(1.1); }
}

:deep(.el-dialog) {
  transition: all .3s;
  overflow: auto;
  border-radius: 10px;
  height: 70%;

  @media (max-width: 1400px) { width: 45%; }
  @media (max-width: 1000px) { width: 60%; }
  @media (max-width: 760px)  { width: 70%; }
  @media (max-width: 600px)  { width: 90%; }
}

@media screen and (max-width: 650px) {
  :deep(.el-dialog) {
    border-radius: 0;
    margin-top: 0;
    margin-bottom: 0;
    width: 100vw;
    height: 100%;
  }
}
</style>
