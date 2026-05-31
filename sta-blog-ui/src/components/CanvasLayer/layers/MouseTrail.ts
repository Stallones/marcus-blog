/**
 * MouseTrail — 鼠标拖尾效果层
 * 从 Header/MouseTrail.vue 迁移，改为纯 TS + 外部 canvas 绘制
 */
import { mouseTrailConfig, mouseTrailEnabled } from "../index.ts";

interface Point {
  x: number; y: number; size: number; color: string; age: number;
}

export interface MouseTrailInstance {
  init(canvas: HTMLCanvasElement): void;
  tick(): void;
  resize(w: number, h: number): void;
  destroy(): void;
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let points: Point[] = [];
let mouseX = 0;
let mouseY = 0;
let mouseActive = false;

function addPoint(x: number, y: number) {
  const cfg = mouseTrailConfig;
  const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
  points.push({
    x, y,
    size: Math.random() * (cfg.sizeRange[1] - cfg.sizeRange[0]) + cfg.sizeRange[0],
    color,
    age: 0,
  });
}

function onMouseMove(e: MouseEvent) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (mouseEnabled()) addPoint(mouseX, mouseY);
}

function mouseEnabled() {
  return mouseTrailEnabled.value;
}

/** 创建鼠标拖尾实例 */
export function createMouseTrail(): MouseTrailInstance {
  return {
    init(el: HTMLCanvasElement) {
      canvas = el;
      ctx = el.getContext("2d");
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseenter", () => { mouseActive = true; });
      window.addEventListener("mouseleave", () => { mouseActive = false; });
    },

    tick() {
      if (!ctx || !canvas || !mouseEnabled()) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.age++;
        if (p.age >= mouseTrailConfig.lifetime) {
          points.splice(i, 1); i--; continue;
        }
        const size = p.size * (1 - p.age / mouseTrailConfig.lifetime);
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - p.age / mouseTrailConfig.lifetime;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    },

    resize(w: number, h: number) {
      if (!canvas) return;
      canvas.width = w;
      canvas.height = h;
    },

    destroy() {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseenter", () => { mouseActive = true; });
      window.removeEventListener("mouseleave", () => { mouseActive = false; });
      points = [];
      canvas = null;
      ctx = null;
    },
  };
}
