import { ApiResponse, ArticleContentVO, ArticleVO, Page } from "@/types";
import { isCrypto, decrypt } from "@/utils/crypto";
import { bannerImages } from "@/utils/banner-images";
import type WebsiteInfo from "@/apis/website/type.ts";
import { ARCHIVE_CATEGORY_CONS } from "@/const";

//读文章内容
const readArticleContent = async (
  articleId: number,
  isOmit: boolean = false,
  total: number = 100
) => {
  if (!articleId) return "";
  const res = await localResponse<ArticleContentVO>(`/articles/${articleId}`);
  if (res.code !== 200) return `文章${articleId}不存在`;
  if (!isOmit) return res.data.articleContent;
  else return res.data.articleContent.substring(0, total);
};

// 获取文章详细（离线模式：从 article-detail.json 中按 id 查找）
export const readArticleDetail = async (id: string) => {
  const articleList = await localResponse<ArticleVO[]>("/apis/article-detail");
  if (!articleList.data)
    return { code: 201, msg: "文章数据未同步", data: null };

  const article = articleList.data.find((a) => a.id === Number(id));
  const articleContent = await readArticleContent(Number(id));
  if (article == undefined || articleContent.length == 0)
    return { code: 201, msg: "文章不存在", data: null };

  article.articleContent = articleContent;
  return { code: 200, msg: "success", data: article };
};

// 获取首页文章列表
export async function readArticlePage(pageNum: Number, pageSize: Number) {
  //1. fethc本地文章
  const articleList = await localResponse<ArticleVO[]>("/apis/article-detail");
  if (!articleList.data)
    return { code: 201, msg: "文章数据未同步", data: null };

  //2. 根据 id 填充 articleContent
  for (const article of articleList.data as ArticleVO[]) {
    const content = await readArticleContent(article.id, true);
    if (content) {
      article.articleContent = content; // ← 直接修改原对象，保留引用
    }
  }

  // 3. 分页
  const start = (Number(pageNum) - 1) * Number(pageSize);
  const end = start + Number(pageSize);
  const pageSlice = articleList.data.slice(start, end);

  // 4. 拼装 Page 结构
  const page: Page<ArticleVO> = {
    page: pageSlice,
    total: articleList.data.length,
  };
  return { code: 200, msg: "success", data: page };
}

// 获取分类列表（离线模式：从 category-with-article.json 读取）
export function readCategoryList() {
  return localResponse("/apis/category-with-article");
}

// 获取标签列表（离线模式：从 tag-with-article.json 读取）
export function readTagList() {
  return localResponse("/apis/tag-with-article");
}

// 获取网站信息
export function readWebsiteInfo() {
  return localResponse<WebsiteInfo>("/apis/website-info");
}

// 获取归档下的文章列表（离线模式，通用）
// archiveType: ARCHIVE_CATEGORY_CONS → 从 category-with-article 找; 否则 → 从 tag-with-article 找
export async function readArchiveArticleList(
  archiveType: string,
  archiveId: number
) {
  const isCategory = archiveType === ARCHIVE_CATEGORY_CONS;
  const dataFile = isCategory
    ? "/apis/category-with-article"
    : "/apis/tag-with-article";
  const entityLabel = isCategory ? "分类" : "标签";

  const entityRes = await localResponse<any[]>(dataFile);
  if (!entityRes.data)
    return { code: 201, msg: `${entityLabel}数据未同步`, data: null };

  const entity = entityRes.data.find((e) => e.id === archiveId);
  if (!entity) return { code: 201, msg: `${entityLabel}不存在`, data: null };

  const articleIdList: number[] = entity.articleIdList;

  const articleRes = await localResponse<any[]>("/apis/article-detail");
  if (!articleRes.data)
    return { code: 201, msg: "文章数据未同步", data: null };

  const articles = articleRes.data.filter((a) =>
    articleIdList.includes(a.id)
  );
  return { code: 200, msg: "success", data: articles };
}

// 获取时间轴文章列表（离线模式：从 article-detail 汇总并填充内容）
export async function readTimeLine() {
  const articleList = await localResponse<ArticleVO[]>("/apis/article-detail");
  if (!articleList.data)
    return { code: 201, msg: "文章数据未同步", data: null };

  for (const article of articleList.data as ArticleVO[]) {
    const content = await readArticleContent(article.id, true);
    if (content) {
      article.articleContent = content;
    }
  }

  return { code: 200, msg: "success", data: articleList.data };
}

// 获取搜索标题列表
export function readSearchTitleList() {
  return localResponse("/apis/search-titles");
}

// 获取用户信息（离线模式返回 null）
// export function readUserInfo(): Promise<ApiResponse<UserInfo | null>> {
//   return Promise.resolve({
//     code: 200,
//     msg: "success",
//     data: null,
//   });
// }

// 获取banner列表（离线模式返回本地图片）
export function readBanners() {
  return Promise.resolve({ code: 200, msg: "success", data: bannerImages });
}

/** 本地搜索：根据文章 ID 列表从离线 JSON 提取完整 ArticleVO 列表 */
export async function searchLocalArticles(ids: number[]): Promise<Page<ArticleVO>> {
  const articleRes = await localResponse<ArticleVO[]>("/apis/article-detail");
  const articles = (articleRes.data || []).filter((a) => ids.includes(a.id));

  for (const article of articles) {
    try {
      const content = await readArticleContent(article.id, true, 60);
      if (content) article.articleContent = content;
    } catch {
      article.articleContent = "";
    }
  }

  return { page: articles, total: articles.length };
}

/** 从本地文件加载离线数据，根据 isCrypto() 自动补 .enc 或 .json 后缀
 * @param filePath 文件路径（不含后缀），如 '/apis/search-titles'、'/articles/3'
 */
export async function localResponse<T = any>(
  filePath: string
): Promise<ApiResponse<T>> {
  const encrypted = isCrypto();
  const res = await fetch(filePath + (encrypted ? ".enc" : ".json"));
  if (!res.ok) throw new Error(`本地文件不存在: ${filePath}`);
  const data: T = encrypted ? decrypt(await res.text()) : await res.json();
  return { code: 200, msg: "success", data };
}
