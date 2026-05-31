import { ref, reactive } from "vue";

// ============================================================
// CanvasLayer 公共配置 API
// 各页面 / 组件通过 import 读写这些响应式状态来控制画布行为
// ============================================================

/** 画布 header 偏移量（px）。
 *  页面 header 写入 → 背景视差层据此计算初始偏移和滚动相位 */
export const canvasHeaderH = ref(0);

/** 背景图片 URL。空字符串 = 使用主题变量纯色背景 */
export const canvasImageUrl = ref("");

/** 鼠标拖尾效果开关 */
export const mouseTrailEnabled = ref(true);

/** 粒子效果开关 */
export const particlesEnabled = ref(true);

// ---- 粒子配置 ----
export const particleConfig = reactive({
  /** 粒子数量 */
  count: 50,
  /** 粒子尺寸范围 [min, max] */
  sizeRange: [1, 4] as [number, number],
  /** 移动速度范围 [min, max] */
  speedRange: [0.15, 0.5] as [number, number],
  /** 鼠标排斥半径 (px) */
  mouseRepelRadius: 100,
  /** 粒子连线距离阈值 (px) */
  linkDistance: 100,
  /** 线条粗细 */
  lineWidth: 0.5,
  /** 阻尼系数（每帧速度衰减） */
  damping: 0.99,
});

// ---- 鼠标拖尾配置 ----
export const mouseTrailConfig = reactive(
  {
    /** 最大拖尾点数 */
    maxPoints: 50,
    /** 点尺寸范围 [min, max] */
    sizeRange: [5, 20] as [number, number],
    /** 点生命周期（帧数） */
    lifetime: 50,
    colors: [
      "#f79533", "#f37055", "#ef4e7b", "#a166ab",
      "#5073b8", "#1098ad", "#07b39b", "#6fba82",
    ],
  } as { maxPoints: number; sizeRange: [number, number]; lifetime: number; colors: string[] }
);
