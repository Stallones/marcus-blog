import { ref } from "vue";

/** 阅读模式开关，模块级共享 ref，仿 canvasHeaderH 模式
 *  Article.vue 用 isReadingMode 做 v-if 条件
 *  BottomRightLayout 用 toggleReadingMode 触发切换
 */
export const isReadingMode = ref(false);

export function toggleReadingMode() {
  isReadingMode.value = !isReadingMode.value;
}
