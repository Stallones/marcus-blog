/**
 * useTypewriter — 纯手写打字机效果 composable
 * 不依赖第三方库，支持静态文本数组或 URL 自动获取
 *
 * 用法：
 *   const { output, cursor, isTyping, start, stop, restart } = useTypewriter({
 *     texts: ['Hello', 'World'],
 *     speed: 80,
 *     backSpeed: 40,
 *     type: 'rollback',
 *     sleep: 2000,
 *   })
 *
 *   // 或使用 URL 模式
 *   const { output } = useTypewriter({
 *     url: 'https://api.example.com/sentence',
 *     speed: 100,
 *   })
 */
import { ref, shallowRef, onUnmounted, type Ref } from "vue";

export interface TypewriterOptions {
  /** 静态文本数组（与 url 二选一） */
  texts?: string[];
  /** 数据获取 URL，fetch 后逐句输出（与 texts 二选一） */
  url?: string;
  /** 打字速度 (ms/字) */
  speed?: number;
  /** 回退速度 (ms/字) */
  backSpeed?: number;
  /** 行为模式: 'normal' = 打完停 | 'rollback' = 打完回退再打下一条 */
  type?: "normal" | "rollback";
  /** 完整输出一句话后暂停时间 (ms) */
  sleep?: number;
  /** 单次回退（打完后只回退一次就结束） */
  singleBack?: boolean;
  /** 是否显示光标 */
  showCursor?: boolean;
}

export interface TypewriterReturn {
  /** 当前输出文本 */
  output: Ref<string>;
  /** 光标显示状态 */
  cursorVisible: Ref<boolean>;
  /** 是否正在打字 */
  isTyping: Ref<boolean>;
  /** 手动启动 */
  start: (customTexts?: string[]) => void;
  /** 手动停止 */
  stop: () => void;
  /** 重新开始（换一批文本或重新 fetch） */
  restart: () => void;
}

let timerId: ReturnType<typeof setTimeout> | null = null;
let isRunning = false;

/** 清除定时器 */
function clearTimer() {
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
}

/** 延时工具 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    timerId = setTimeout(resolve, ms);
  });
}

/** 从 URL 获取单句文本 */
async function fetchSentence(url: string): Promise<string> {
  const res = await fetch(url);
  const data = await res.json();
  // 兼容 hitokoto 格式 { hitokoto: "..." } 和纯文本格式
  return data?.hitokoto ?? data?.sentence ?? String(data);
}

export function useTypewriter(options: TypewriterOptions = {}): TypewriterReturn {
  const {
    texts: inputTexts = [],
    url,
    speed = 80,
    backSpeed = 40,
    type = "rollback",
    sleep = 2000,
    singleBack = false,
    showCursor = true,
  } = options;

  const output = ref("");
  const cursorVisible = ref(true);
  const isTyping = ref(false);

  // 用 shallowRef 避免深层响应代理
  const textQueue = shallowRef<string[]>([...inputTexts]);
  let currentIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let stopped = false;

  /** 获取当前句 */
  function currentText(): string {
    if (textQueue.value.length === 0) return "";
    return textQueue.value[currentIndex % textQueue.value.length];
  }

  /** 逐帧驱动 */
  async function tick() {
    if (stopped) return;

    const text = currentText();
    if (!text) return;

    if (!isDeleting) {
      // 正在打字
      charIndex++;
      output.value = text.slice(0, charIndex);

      if (charIndex >= text.length) {
        // 打完了
        if (type === "rollback" && !singleBack) {
          // rollback 模式：暂停后回退
          isTyping.value = false;
          await delay(sleep);
          if (stopped) return;
          isDeleting = true;
          tick();
        } else if (singleBack) {
          // singleBack 模式：暂停后回退一次
          isTyping.value = false;
          await delay(sleep);
          if (stopped) return;
          isDeleting = true;
          tick();
        } else {
          // normal 模式：暂停后切下一句
          isTyping.value = false;
          await delay(sleep);
          if (stopped) return;
          currentIndex++;
          charIndex = 0;
          output.value = "";
          tick();
        }
        return;
      }

      isTyping.value = true;
      timerId = setTimeout(tick, speed);
    } else {
      // 正在回退
      charIndex--;
      output.value = text.slice(0, charIndex);

      if (charIndex <= 0) {
        // 回退完了
        isDeleting = false;
        currentIndex++;
        charIndex = 0;

        if (url) {
          // URL 模式：重新 fetch 下一句
          try {
            const sentence = await fetchSentence(url);
            textQueue.value = [sentence];
          } catch {
            // 失败时重复当前句
          }
          if (stopped) return;
          tick();
        } else if (singleBack) {
          // singleBack 打完就结束
          isTyping.value = false;
          stopped = true;
          return;
        } else {
          // 静态数组模式：继续下一句
          tick();
        }
        return;
      }

      timerId = setTimeout(tick, backSpeed);
    }
  }

  /** 启动 */
  function start(customTexts?: string[]) {
    stop();
    stopped = false;
    if (customTexts) {
      textQueue.value = [...customTexts];
    }
    currentIndex = 0;
    charIndex = 0;
    isDeleting = false;
    output.value = "";
    isTyping.value = true;

    if (url && textQueue.value.length === 0) {
      // 首次 URL fetch
      fetchSentence(url)
        .then((sentence) => {
          textQueue.value = [sentence];
          tick();
        })
        .catch(() => {
          output.value = "";
          isTyping.value = false;
        });
    } else {
      tick();
    }
  }

  /** 停止 */
  function stop() {
    stopped = true;
    clearTimer();
    isTyping.value = false;
  }

  /** 重新开始 */
  function restart() {
    currentIndex = 0;
    charIndex = 0;
    isDeleting = false;
    start();
  }

  // 光标闪烁由 CSS 处理，这里只需控制可见性
  cursorVisible.value = showCursor;

  return {
    output,
    cursorVisible,
    isTyping,
    start,
    stop,
    restart,
  };
}
