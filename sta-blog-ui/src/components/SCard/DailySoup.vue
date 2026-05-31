<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSoup } from "@/apis/thirdParty";

const soup = ref('')

async function soupSub() {
  const res: any = await getSoup();
  soup.value = res.hitokoto
}

onMounted(async () => {
  const res: any = await getSoup();
  soup.value = res.hitokoto
})
</script>

<template>
  <Card title="每日鸡汤" prefix-icon="edit" suffix-icon="rotate" :isRotate="true" :isScale="true" @invoke="soupSub">
    <div class="soup-container">
      <i class="soup-quote-left">"</i>
      <Transition name="fade" mode="out-in">
        <p class="soup-text" :key="soup">{{ soup }}</p>
      </Transition>
      <i class="soup-quote-right">"</i>
    </div>
  </Card>
</template>

<style scoped lang="scss">
.soup-container {
  position: relative;
  padding: 10px 25px;
  margin: 10px 0;

  .soup-text {
    font-size: 15px;
    line-height: 1.6;
    color: var(--el-text-color-primary);
    text-align: center;
    font-style: italic;
    margin: 0;
    padding: 0 10px;
    transition: all 0.3s ease;
  }

  .soup-quote-left,
  .soup-quote-right {
    position: absolute;
    font-size: 32px;
    color: var(--el-color-primary-light-7);
    font-family: "Times New Roman", serif;
    opacity: 0.6;
  }

  .soup-quote-left {
    top: -5px;
    left: 5px;
  }

  .soup-quote-right {
    bottom: -15px;
    right: 5px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
