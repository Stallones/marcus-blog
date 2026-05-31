import { useBottomRightState } from "./bottomRightState";

/**
 * 注册全局功能项（在 Layout 挂载时调用一次）
 * 这些功能项在所有页面都默认展示
 */
export function registerGlobalItems() {
  const { registerItem } = useBottomRightState();

  // 回到顶部 — 全局
  registerItem({ id: "toTop", global: true, order: 100 });

  // 滚动百分比 — 全局
  registerItem({ id: "scrollPercentage", global: true, order: 200 });

  // 亮暗色切换 — 全局
  registerItem({ id: "colorMode", global: true, order: 300 });
}
