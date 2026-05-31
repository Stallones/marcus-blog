<template>
  <header class="page-header">
    <Nav />
    <Banner :title="title" :subtitle="subtitle || ''" />
  </header>
</template>

<script setup lang="ts">
import Nav from "@/components/Nav/index.vue";
import Banner from "@/components/Banner.vue";

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
});
</script>

<style scoped lang="scss">
.page-header {
  position: relative;
  width: 100%;
  overflow: hidden;
}
</style>
