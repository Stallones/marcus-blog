/**
 * 构建脚本：用 Pagefind JS API 为所有文章生成离线搜索索引
 * 输出到 dist/pagefind/，供生产环境使用
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createIndex, close } from "pagefind";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../..");
const ARTICLES_JSON = join(PROJECT_ROOT, "public/apis/article-detail.json");
const ARTICLES_DIR = join(PROJECT_ROOT, "public/articles");
const OUTPUT_PATH = join(PROJECT_ROOT, "dist/pagefind");

/**
 * 基础的 Markdown → 纯文本 剥离
 */
function stripMarkdown(md) {
  if (!md) return "";
  return md
    // 移除代码块 ```...```
    .replace(/```[\s\S]*?```/g, "")
    // 移除行内代码
    .replace(/`([^`]+)`/g, "$1")
    // 移除图片 ![alt](url) → alt
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    // 移除链接 [text](url) → text
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
    // 移除标题标记 #
    .replace(/^#{1,6}\s+/gm, "")
    // 移除粗斜体
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // 移除引用 >
    .replace(/^>\s+/gm, "")
    // 移除分隔线 ---
    .replace(/^---+\s*$/gm, "")
    // 移除列表标记
    .replace(/^[\s]*[-*+]\s+/gm, "")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    // 移除 HTML 标签
    .replace(/<[^>]+>/g, "")
    // 合并多余空行
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main() {
  console.log("[Pagefind Build] 读取文章清单...");
  const raw = readFileSync(ARTICLES_JSON, "utf-8");
  const articles = JSON.parse(raw);
  console.log(`[Pagefind Build] 共 ${articles.length} 篇文章`);

  const { index } = await createIndex();

  let indexed = 0;
  for (const article of articles) {
    const { id, articleTitle } = article;
    const articlePath = join(ARTICLES_DIR, `${id}.json`);

    if (!existsSync(articlePath)) {
      console.warn(`[WARN] 文章内容文件不存在: articles/${id}.json，跳过`);
      continue;
    }

    const articleRaw = readFileSync(articlePath, "utf-8");
    const articleData = JSON.parse(articleRaw);
    const content = stripMarkdown(articleData.articleContent || "");

    if (!content && !articleTitle) {
      console.warn(`[WARN] 文章 ${id} 内容为空，跳过`);
      continue;
    }

    await index.addCustomRecord({
      url: `/article/${id}`,
      content: `${articleTitle}\n${content}`,
      language: "zh",
      meta: {
        title: articleTitle,
      },
    });
    indexed++;
  }

  await index.writeFiles({ outputPath: OUTPUT_PATH });
  await close();
  console.log(`[Pagefind Build] ✅ 索引已生成到 ${OUTPUT_PATH}（${indexed} 篇）`);
}

main().catch((err) => {
  console.error("[Pagefind Build] ❌ 失败:", err);
  process.exit(1);
});
