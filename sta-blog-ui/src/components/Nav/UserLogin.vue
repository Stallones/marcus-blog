<template>
  <div v-if="isServiceAvailable" class="user-login">
    <!-- 未登录 -->
    <div v-if="!userStore.userInfo">
      <el-tooltip class="box-item" effect="light" content="点击去登录" placement="right">
        <el-avatar @click="$router.push('/welcome')" style="margin-right: 3rem">登录</el-avatar>
      </el-tooltip>
    </div>

    <!-- 已登录 -->
    <div v-else class="logged-in">
      <div class="profile">
        <div class="profile-username">{{ userStore.userInfo?.username }}</div>
        <div class="profile-email" v-if="userStore.userInfo?.registerType === 0">
          {{ userStore.userInfo?.email }}
        </div>
        <div class="profile-email" v-else>
          {{ userStore.userInfo?.registerType === 1 ? 'Gitee登录' : 'Github登录' }}
        </div>
      </div>
      <el-dropdown>
        <el-avatar style="margin-right: 3rem" :src="userStore.userInfo?.avatar" />
        <template #dropdown>
          <el-dropdown-item @click="router.push('/setting')">
            <el-icon><Setting /></el-icon>
            个人设置
          </el-dropdown-item>
          <el-dropdown-item @click="logoutSub">
            <el-icon><Promotion /></el-icon>
            退出登录
          </el-dropdown-item>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Setting, Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { logout } from '@/apis/user'
import { REMOVE_TOKEN } from '@/utils/auth.ts'
import useUserStore from '@/store/modules/user.ts'
import router from '@/router'

defineProps<{ isServiceAvailable: boolean }>()

const userStore = useUserStore()

const logoutSub = async () => {
  const res: any = await logout()
  if (res.code === 200) {
    REMOVE_TOKEN()
    userStore.userInfo = undefined
    ElMessage.success('退出登录成功')
    router.push('/')
  }
}
</script>

<style scoped lang="scss">
.user-login {
  .logged-in { display: flex; }
}

.profile {
  .profile-username {
    font-size: 15px;
    font-weight: bold;
    color: var(--el-text-color-primary);
    html.dark & { color: #e5e7eb; }
  }
  .profile-email {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-top: 3px;
    html.dark & { color: #9ca3af; }
  }
}
</style>
