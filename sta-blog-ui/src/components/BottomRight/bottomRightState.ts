import { ref, computed } from "vue";

// ── 功能项类型 ──
export interface BottomRightItem {
  /** 唯一标识 */
  id: string;
  /** 全局项：始终默认展示；独有项：需点击「更多」展开展示 */
  global: boolean;
  /** 渲染顺序，越小越靠前 */
  order: number;
}

// ── 已注册的功能项列表 ──
const registeredItems = ref<BottomRightItem[]>([]);

// ── 分类计算 ──
const globalItems = computed(() =>
  registeredItems.value
    .filter((item) => item.global)
    .sort((a, b) => a.order - b.order)
);

const uniqueItems = computed(() =>
  registeredItems.value
    .filter((item) => !item.global)
    .sort((a, b) => a.order - b.order)
);

// ── 更多面板展开状态 ──
const isExpanded = ref(false);

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

// ── 注册/注销功能项 ──
function registerItem(item: BottomRightItem) {
  if (registeredItems.value.some((i) => i.id === item.id)) return;
  registeredItems.value.push(item);
}

function unregisterItem(id: string) {
  registeredItems.value = registeredItems.value.filter((i) => i.id !== id);
}

/**
 * 判断某功能项是否已注册
 * 模板中用 v-if="hasItem('readingMode')" 控制渲染
 */
function hasItem(id: string) {
  return registeredItems.value.some((i) => i.id === id);
}

// ── 滚动百分比（全局共享，由各页面写入） ──
const scrollPercentage = ref("0%");

export function useBottomRightState() {
  return {
    registeredItems,
    globalItems,
    uniqueItems,
    isExpanded,
    toggleExpanded,
    registerItem,
    unregisterItem,
    hasItem,
    scrollPercentage,
  };
}
