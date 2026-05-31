/**
 * BackgroundParallax — 背景视差滚动层
 * 从原 CanvasLayer/index.vue 抽离的背景绘制 + 滚动偏移逻辑
 */
import type { Ref } from "vue";
import { canvasHeaderH, canvasImageUrl } from "../index.ts";

export interface ParallaxInstance {
  init(canvas: HTMLCanvasElement): void;
  tick(): void;
  resize(w: number, h: number): void;
  destroy(): void;
}

const SPEED = 1.0;

let mainCanvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let offscreen: HTMLCanvasElement | null = null;
let offCtx: CanvasRenderingContext2D | null = null;
let loadedImage: HTMLImageElement | null = null;
let contentH = 0;
let themeObserver: MutationObserver | null = null;

function getCanvasBg(): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue("--mao-canvas-bg")
    .trim() || "#f8f9fa";
}

function drawOffscreen(w: number, h: number) {
  if (!offCtx) return;
  if (loadedImage) {
    const imgRatio = loadedImage.naturalWidth / loadedImage.naturalHeight;
    const targetRatio = w / h;
    let sw: number, sh: number, sx: number, sy: number;
    if (imgRatio > targetRatio) {
      sh = loadedImage.naturalHeight;
      sw = sh * targetRatio;
      sy = 0;
      sx = (loadedImage.naturalWidth - sw) / 2;
    } else {
      sw = loadedImage.naturalWidth;
      sh = sw / targetRatio;
      sx = 0;
      sy = (loadedImage.naturalHeight - sh) / 2;
    }
    offCtx.drawImage(loadedImage, sx, sy, sw, sh, 0, 0, w, h);
  } else {
    offCtx.fillStyle = getCanvasBg();
    offCtx.fillRect(0, 0, w, h);
  }
}

function loadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { loadedImage = img; resolve(); };
    img.onerror = () => { console.warn("[BackgroundParallax] 图片加载失败:", url); resolve(); };
    img.src = url;
  });
}

function blit() {
  if (!mainCanvas || !ctx || !offscreen) return;
  const viewportH = mainCanvas.height;
  const hh = canvasHeaderH.value;
  const scrolled = window.scrollY * SPEED;

  ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

  if (hh > 0) {
    const maxSource = Math.max(0, contentH - viewportH);
    const sourceY = Math.min(maxSource, scrolled + hh);
    ctx.drawImage(offscreen, 0, sourceY, mainCanvas.width, viewportH, 0, 0, mainCanvas.width, viewportH);
    return;
  }

  if (scrolled <= 0) return;
  let sourceY: number, drawH: number, destY: number;
  if (scrolled < viewportH) {
    drawH = scrolled;
    sourceY = contentH - drawH;
    destY = viewportH - drawH;
  } else {
    sourceY = Math.max(0, contentH - scrolled);
    drawH = viewportH;
    destY = 0;
  }
  ctx.drawImage(offscreen, 0, sourceY, mainCanvas.width, drawH, 0, destY, mainCanvas.width, drawH);
}

/** 创建视差背景实例 */
export function createParallax(): ParallaxInstance {
  return {
    init(canvas: HTMLCanvasElement) {
      mainCanvas = canvas;
      ctx = canvas.getContext("2d");
      offscreen = document.createElement("canvas");
      offCtx = offscreen.getContext("2d");

      // 加载图片
      if (canvasImageUrl.value) {
        loadImage(canvasImageUrl.value).then(() => {
          if (mainCanvas) {
            resize(mainCanvas.width, mainCanvas.height);
            blit();
          }
        });
      }

      // 监听主题切换
      themeObserver = new MutationObserver(() => {
        if (offscreen && offCtx) {
          drawOffscreen(offscreen.width, offscreen.height);
          blit();
        }
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    },

    tick() { blit(); },

    resize(w: number, h: number) {
      if (!mainCanvas || !offscreen || !offCtx) return;
      mainCanvas.width = w;
      mainCanvas.height = h;
      contentH = h;
      offscreen.width = w;
      offscreen.height = contentH;
      drawOffscreen(offscreen.width, offscreen.height);
      blit();
    },

    destroy() {
      themeObserver?.disconnect();
      themeObserver = null;
      mainCanvas = null;
      ctx = null;
      offscreen = null;
      offCtx = null;
      loadedImage = null;
    },
  };
}
