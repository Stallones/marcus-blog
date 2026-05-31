<!-- 底部 -->
<script setup lang="ts">
import useWebsiteStore from "@/store/modules/website.ts";

const useWebsite = useWebsiteStore()

</script>
<template>
  <div class="Footer">
    <!-- 文章页脚 -->
    <div class="footer_container">
      <div class="footer_text">
        <div>&copy;{{ useWebsite.webInfo?.websiteName }}</div>
        <div>备案号：<a href="https://beian.miit.gov.cn">{{ useWebsite.webInfo?.recordInfo }}</a></div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
// 与 Layout/main-wrapper 共享的最大宽度
$footer-max-width: 1200px;

.Footer {
  box-shadow: 0 0 10px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 50px;
  // 渐变底部
  background: var(--mao-bg-footer);
}

.footer_container {
  max-width: $footer-max-width;
  margin: 0 auto;          // 居中对齐
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 1.5rem;
  box-sizing: border-box;

  @media screen and (max-width: 910px) {
    padding: 0 1rem;
  }
}

.footer_text {
  line-height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #fff;
}

</style>