/**
 * 静态数据生成脚本
 * 从后端 API 获取全量数据，生成 JSON 文件到 public/ 目录
 *
 * 用法: npx tsx src/utils/generate-static-data.ts
 * 自定义地址: npx tsx src/utils/generate-static-data.ts http://192.168.20.128:50001
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

import { encrypt,isCrypto } from "./crypto";

// ==================== 类型定义 ====================

interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

interface ArticlePage<T = any> {
  page: T[];
}

interface WebsiteInfo {
  webmasterAvatar: string;
  webmasterName: string;
  webmasterCopy: string;
  webmasterProfileBackground: string;
  giteeLink: string;
  githubLink: string;
  websiteName: string;
  headerNotification: string;
  sidebarAnnouncement: string;
  recordInfo: string;
  startTime: string;
  lastUpdateTime: string;
  articleCount: number;
  categoryCount: number;
  commentCount: number;
  wordCount: number;
  visitCount: number;
}

interface Category {
  id: number;
  categoryName: string;
}

interface Tag {
  id: number;
  tagName: string;
}

interface Article {
  id: number;
  title: string;
  [key: string]: any;
}

// ==================== 配置 ====================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const API_BASE_URL = process.argv[2] || "http://192.168.20.128:50001";
const OUTPUT_DIR = path.join(PROJECT_ROOT, "public");
const ARTICLES_DIR = path.join(OUTPUT_DIR, "articles");
const API_DIR = path.join(OUTPUT_DIR, "apis");

// ==================== 工具函数 ====================

async function fetchOnce<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

function saveEncrypted(filename: string, data: any): void {
  const encFilename = isCrypto() ? filename.replace(/\.json$/, ".enc") : filename;
  fs.writeFileSync(encFilename, encrypt(data));
  console.log(`  ✅ ${path.basename(encFilename)} 已生成`);
}

// ==================== 数据获取函数 ====================

async function fetchWebsiteInfo(): Promise<WebsiteInfo | null> {
  try {
    const res = await fetchOnce<ApiResponse<WebsiteInfo>>(
      `${API_BASE_URL}/websiteInfo/front`
    );
    if (res.code === 200) return res.data;
    throw new Error(res.msg);
  } catch (error: any) {
    console.error("  ❌ 获取网站信息失败:", error.message);
    return null;
  }
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetchOnce<ApiResponse<Category[]>>(
      `${API_BASE_URL}/category/list`
    );
    if (res.code === 200) return res.data;
    throw new Error(res.msg);
  } catch (error: any) {
    console.error("  ❌ 获取分类列表失败:", error.message);
    return [];
  }
}

async function fetchTags(): Promise<Tag[]> {
  try {
    const res = await fetchOnce<ApiResponse<Tag[]>>(
      `${API_BASE_URL}/tag/list`
    );
    if (res.code === 200) return res.data;
    throw new Error(res.msg);
  } catch (error: any) {
    console.error("  ❌ 获取标签列表失败:", error.message);
    return [];
  }
}

async function fetchArticleList(): Promise<Article[]> {
  try {
    const res = await fetchOnce<ApiResponse<ArticlePage<Article>>>(
      `${API_BASE_URL}/article/list?pageNum=1&pageSize=1000`
    );
    if (res.code === 200) return res.data?.page || [];
    throw new Error(res.msg);
  } catch (error: any) {
    console.error("  ❌ 获取文章列表失败:", error.message);
    return [];
  }
}

async function fetchArticleDetail(id: number): Promise<Article | null> {
  try {
    const res = await fetchOnce<ApiResponse<Article>>(
      `${API_BASE_URL}/article/detail/${id}`
    );
    if (res.code === 200) return res.data;
    throw new Error(res.msg);
  } catch (error: any) {
    console.error(`  ❌ 获取文章 ${id} 详情失败:`, error.message);
    return null;
  }
}

async function fetchSearchTitles(): Promise<any[]> {
  try {
    const res = await fetchOnce<ApiResponse<any[]>>(
      `${API_BASE_URL}/article/search/init/title`
    );
    if (res.code === 200) return res.data || [];
    throw new Error(res.msg);
  } catch (error: any) {
    console.error("  ❌ 获取搜索标题数据失败:", error.message);
    return [];
  }
}

// ==================== 主流程 ====================

async function main(): Promise<void> {
  console.log("=== 开始生成静态数据 ===");
  console.log(`API: ${API_BASE_URL}`);
  console.log(`输出: ${OUTPUT_DIR}\n`);

  // 确保目录存在
  if (!fs.existsSync(ARTICLES_DIR)) {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  }
  if (!fs.existsSync(API_DIR)) {
    fs.mkdirSync(API_DIR, { recursive: true });
  }

  // 1. 网站信息
  console.log("正在获取网站信息...");
  const webInfo = await fetchWebsiteInfo();
  if (webInfo) {
    saveEncrypted(path.join(API_DIR, "website-info.json"), webInfo);
  } else {
    console.log("  ❌ 获取网站信息失败");
  }

  // 2. 分类列表
  console.log("\n正在获取分类列表...");
  const categories = await fetchCategories();
  if (categories.length > 0) {
    saveEncrypted(path.join(API_DIR, "categories.json"), categories);
    console.log(`  (${categories.length} 个分类)`);
  } else {
    console.log("  ❌ 获取分类列表失败，跳过");
  }

  // 3. 标签列表
  console.log("\n正在获取标签列表...");
  const tags = await fetchTags();
  if (tags.length > 0) {
    saveEncrypted(path.join(API_DIR, "tags.json"), tags);
    console.log(`  (${tags.length} 个标签)`);
  } else {
    console.log("  ❌ 获取标签列表失败，跳过");
  }

  // 4. 文章列表
  console.log("\n正在获取文章列表...");
  const articles = await fetchArticleList();
  if (articles.length > 0) {
    console.log(`  共 ${articles.length} 篇文章`);
    saveEncrypted(path.join(API_DIR, "article-list.json"), articles);

    for (const article of articles) {
      console.log(`\n正在获取文章详情 ID=${article.id}...`);
      const detail = await fetchArticleDetail(article.id);
      if (detail) {
        saveEncrypted(path.join(ARTICLES_DIR, `${article.id}.json`), detail);
      }
    }
  } else {
    console.log("  ❌ 获取文章列表失败，跳过");
  }

  // 5. 搜索标题数据
  console.log("\n正在获取搜索标题数据...");
  const searchTitles = await fetchSearchTitles();
  if (searchTitles.length > 0) {
    saveEncrypted(path.join(API_DIR, "search-titles.json"), searchTitles);
    console.log(`  (${searchTitles.length} 条标题)`);
  } else {
    console.log("  ❌ 获取搜索标题数据失败，跳过");
  }

  console.log("\n=== 静态数据生成完成 ===");
}

main().catch((err) => {
  console.error("\n脚本执行失败:", err.message);
  process.exit(1);
});
