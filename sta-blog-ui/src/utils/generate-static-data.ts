/**
 * 静态数据生成脚本
 * 从后端 API 获取全量数据，生成文件到 public/ 目录
 *
 * 用法: npx tsx src/utils/generate-static-data.ts
 * 自定义地址: npx tsx src/utils/generate-static-data.ts http://127.0.0.1:50001
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { encrypt, isCrypto } from "./crypto";
import { ApiResponse, ArticleContentVO } from "@/types";

// ==================== 类型定义 ====================

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

/** /localSync/article-detail 返回条目 */
export interface ArticleDetailVO {
    id: number;
    [key: string]: any;
}

/** /localSync/category-with-article 返回条目 */
export interface CategoryWithArticleVO {
    id: number;
    categoryName: string;
    articleCount: number;
    articleIdList: number[];
}

/** /localSync/tag-with-article 返回条目 */
export interface TagWithArticleVO {
    id: number;
    tagName: string;
    articleCount: number;
    articleIdList: number[];
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

async function fetchWithRetry<T>(
    url: string,
    retries = 3,
    delay = 1000
): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return (await response.json()) as T;
        } catch (error: any) {
            console.log(`  请求失败 (${i + 1}/${retries}): ${error.message}`);
            if (i === retries - 1) throw error;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw new Error("Unexpected: all retries exhausted");
}

function saveEncrypted(filename: string, data: any): void {
    const newFilename = isCrypto()
        ? filename.replace(/\.json$/, ".enc")
        : filename;
    fs.writeFileSync(newFilename, encrypt(data));
    console.log(`  ✅ ${path.basename(newFilename)} 已生成`);
}

// ==================== 数据获取函数 ====================

/** 获取网站信息（保留原接口） */
async function fetchWebsiteInfo(): Promise<void> {
    try {
        const res = await fetchWithRetry<ApiResponse<WebsiteInfo>>(
            `${API_BASE_URL}/websiteInfo/front`
        );
        if (res.code !== 200) throw new Error(res.msg);
        const item = res.data || {};
        const jsonPath = path.join(API_DIR, "website-info.json");
        saveEncrypted(jsonPath, item);
    } catch (error: any) {
        console.error("  ❌ 获取网站信息失败:", error.message);
    }
}

/** 获取所有文章内容 → 保存为 articles/${id}.json */
async function fetchArticleContents(): Promise<void> {
    try {
        const res = await fetchWithRetry<ApiResponse<ArticleContentVO[]>>(
            `${API_BASE_URL}/localSync/article-content`
        );
        if (res.code !== 200) throw new Error(res.msg);

        const list = res.data || [];
        console.log(`  共 ${list.length} 篇文章内容`);

        for (const item of list) {
            const jsonPath = path.join(ARTICLES_DIR, `${item.id}.json`);
            saveEncrypted(jsonPath, item);
        }
    } catch (error: any) {
        console.error("  ❌ 获取文章内容失败:", error.message);
    }
}

/** 获取所有文章详情 → 保存为 apis/article-detail.json.enc */
async function fetchArticleDetails(): Promise<void> {
    try {
        const res = await fetchWithRetry<ApiResponse<ArticleDetailVO[]>>(
            `${API_BASE_URL}/localSync/article-detail`
        );
        if (res.code !== 200) throw new Error(res.msg);

        const list = res.data || [];
        console.log(`  共 ${list.length} 篇文章详情`);
        saveEncrypted(path.join(API_DIR, "article-detail.json"), list);
    } catch (error: any) {
        console.error("  ❌ 获取文章详情失败:", error.message);
    }
}

/** 获取分类及关联文章ID → 保存为 apis/category-with-article.json.enc */
async function fetchCategoryWithArticle(): Promise<void> {
    try {
        const res = await fetchWithRetry<ApiResponse<CategoryWithArticleVO[]>>(
            `${API_BASE_URL}/localSync/category-with-article`
        );
        if (res.code !== 200) throw new Error(res.msg);

        const list = res.data || [];
        console.log(`  共 ${list.length} 个分类`);
        saveEncrypted(path.join(API_DIR, "category-with-article.json"), list);
    } catch (error: any) {
        console.error("  ❌ 获取分类关联文章失败:", error.message);
    }
}

/** 获取标签及关联文章ID → 保存为 apis/tag-with-article.json.enc */
async function fetchTagWithArticle(): Promise<void> {
    try {
        const res = await fetchWithRetry<ApiResponse<TagWithArticleVO[]>>(
            `${API_BASE_URL}/localSync/tag-with-article`
        );
        if (res.code !== 200) throw new Error(res.msg);

        const list = res.data || [];
        console.log(`  共 ${list.length} 个标签`);
        saveEncrypted(path.join(API_DIR, "tag-with-article.json"), list);
    } catch (error: any) {
        console.error("  ❌ 获取标签关联文章失败:", error.message);
    }
}

// ==================== 主流程 ====================

async function main(): Promise<void> {
    console.log("=== 开始生成静态数据 ===");
    console.log(`API: ${API_BASE_URL}`);
    console.log(`输出: ${OUTPUT_DIR}\n`);

    // 确保目录存在（不删除现有文件）
    if (!fs.existsSync(ARTICLES_DIR)) {
        fs.mkdirSync(ARTICLES_DIR, { recursive: true });
    }
    if (!fs.existsSync(API_DIR)) {
        fs.mkdirSync(API_DIR, { recursive: true });
    }

    // 1. 网站信息（保留原接口）
    console.log("正在获取网站信息...");
    await fetchWebsiteInfo();

    // 2. 文章详情（保存为 article-detail.json.enc）
    console.log("\n正在获取文章详情...");
    await fetchArticleDetails();

    // 3. 文章内容（保存为 .md）
    console.log("\n正在获取文章内容...");
    await fetchArticleContents();

    // 4. 分类及关联文章
    console.log("\n正在获取分类及关联文章...");
    await fetchCategoryWithArticle();

    // 5. 标签及关联文章
    console.log("\n正在获取标签及关联文章...");
    await fetchTagWithArticle();

    console.log("\n=== 静态数据生成完成 ===");
}

main().catch((err) => {
    console.error("\n脚本执行失败:", err.message);
    process.exit(1);
});
