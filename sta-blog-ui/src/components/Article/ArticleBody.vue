<template>
  <div>
    <MdPreview
      :editorId="editorId"
      :theme="(theme as any)"
      :modelValue="content"
      :onHtmlChanged="onHtmlChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/preview.css";

const props = withDefaults(
  defineProps<{
    content: string;
    editorId?: string;
    theme?: "light" | "dark";
  }>(),
  {
    editorId: "preview-only",
    theme: "light",
  }
);

const emit = defineEmits<{
  htmlChanged: [htmlText: string];
}>();

function onHtmlChanged(htmlText: string) {
  emit("htmlChanged", htmlText);
}
</script>

<style scoped lang="scss">
::deep(.md-editor-preview-wrapper) {
  .md-editor-preview {
    color: var(--el-text-color-regular);

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: var(--el-text-color-regular);
    }
  }

  @media screen and (max-width: 910px) {
    padding: 0.2rem;
  }
}
</style>
