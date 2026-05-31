<script setup lang="ts">
import useWebsiteStore from "@/store/modules/website.ts";
import { ElMessageBox } from "element-plus";

const useWebsite = useWebsiteStore()

function announcement() {
  ElMessageBox.alert(`<pre>${useWebsite.webInfo?.sidebarAnnouncement}</pre>`, '公告', {
    confirmButtonText: '关闭',
    closeOnPressEscape: true,
    dangerouslyUseHTMLString: true,
  })
}
</script>

<template>
  <div class="announcement-container" v-slide-in>
    <!-- 坐姿动漫少女 -->
    <div class="anime-girl">
      <img src="@/assets/images/动漫少女坐姿-公告_压缩.png" alt="动漫少女" />
    </div>
    <Card title="公告" prefixIcon="announcement" suffix-icon="jt_y" :isDithering="true" :isArrow="true"
          @invoke="announcement">
      <pre class="pre-text">{{ useWebsite.webInfo?.sidebarAnnouncement }}</pre>
    </Card>
  </div>
</template>

<style scoped lang="scss">
.announcement-container {
  position: relative;
  margin-top: 70px;
}

.anime-girl {
  position: absolute;
  top: -85px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  
  img {
    max-height: 120px;
    width: auto;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    -webkit-user-drag: none;
    user-drag: none;
  }
}

.pre-text {
  text-align: left ;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  max-height: 150px;
  overflow-y: auto;
}
</style>
