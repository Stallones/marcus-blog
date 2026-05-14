<script setup lang="ts">
import usePaginationStore from "@/store/modules/pagination";

const usePagination = usePaginationStore();
const articlePagination = usePagination.articlePagination

</script>

<template>
  <div class="pag">
    <el-pagination background layout="prev, pager, next"
                   :total="articlePagination.total"
                   :hide-on-single-page="true"
                   :page-size="articlePagination.pageSize"
                   @current-change="articlePagination.current = $event"

    />
  </div>
</template>

<style scoped lang="scss">

.pag {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>