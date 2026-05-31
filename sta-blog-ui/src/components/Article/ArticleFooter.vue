<template>
  <div>
    <el-divider border-style="dashed" content-position="left">
      <div style="display: flex; align-items: center">
        <svg-icon name="author_statement"></svg-icon>
        <span style="margin-left: 0.5em">声明</span>
      </div>
    </el-divider>
    <div class="copyright">
      <div class="author">
        <svg-icon name="article_author"></svg-icon>
        <strong>本文作者： {{ websiteStore.webInfo?.webmasterName }}</strong>
      </div>
      <div class="link">
        <svg-icon name="author_link"></svg-icon>
        <strong>本文链接： </strong>
        <a class="copyright_a" :href="env.VITE_FRONTEND_URL + route.path">
          {{ env.VITE_FRONTEND_URL + route.path }}
        </a>
      </div>
      <div class="license">
        <div>
          <svg-icon name="author_copyright"></svg-icon>
          <strong>版权声明： </strong>
        </div>
        <div class="license_text">
          本站所有文章除特别声明外，均采用 &nbsp;
          <a
            class="copyright_a"
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh"
            target="_blank"
          >
            CC BY-NC-SA 4.0
          </a>
          &nbsp; 许可协议。转载请注明文章出处！
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import useWebsiteStore from "@/store/modules/website.ts";

const route = useRoute();
const websiteStore = useWebsiteStore();
const env = import.meta.env;
</script>

<style scoped lang="scss">
.copyright {
  font-size: 0.8em;
  margin: 1rem 0;
  padding: 1rem 2rem;
  border-radius: 0.625rem;
  border: 1px solid var(--el-border-color);
  background-color: var(--mao-background-color);

  .license {
    display: flex;

    & > div:nth-child(1) {
      display: flex;

      @media screen and (max-width: 910px) {
        width: 100%;
      }
    }

    @media screen and (max-width: 910px) {
      flex-direction: column;
    }
  }

  .license_text {
    display: flex;

    @media screen and (max-width: 910px) {
      width: 100%;
      margin-top: 0.5rem;
    }
  }

  .copyright_a {
    color: var(--el-text-color-secondary);

    &:hover {
      color: var(--el-color-primary);
      text-decoration: underline;
    }
  }

  & > div {
    margin: 1rem 0;
    display: flex;
    align-items: center;

    strong {
      margin: 0 0.5rem;
      font-weight: bold;
    }
  }
}
</style>
