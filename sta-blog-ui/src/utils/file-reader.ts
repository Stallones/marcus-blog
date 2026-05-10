import { ApiResponse } from "@/types";
import { isCrypto, decrypt } from "@/utils/crypto";
import { bannerImages } from "@/utils/banner-images";
import type WebsiteInfo from "@/apis/website/type.ts";



// 获取文章详细（离线模式：从 article-detail.json 中按 id 查找）
export const readArticleDetail = async (id: string | string[]) => {
  const articleId = Array.isArray(id) ? id[0] : id
  const detailRes = await localResponse<any[]>('/apis/article-detail')
  const articleMeta = detailRes.data?.find((a: any) => String(a.id) === String(articleId))
  if (!articleMeta) {
    return { code: 404, msg: '文章不存在', data: null }
  }
  // 尝试从 .md 文件加载 articleContent（新格式），不存在则用详情中的内容
  try {
    const mdRes = await fetch(`/articles/${articleId}.md`)
    if (mdRes.ok) {
      articleMeta.articleContent = await mdRes.text()
    }
  } catch { /* 忽略 */ }
  return { code: 200, msg: 'success', data: articleMeta }
}

// 获取首页文章列表
export function readArticleList(pageNum: Number, pageSize: Number) {
  return localResponse<[]>('/apis/article-list').then(res => ({
    ...res,
    data: { page: res.data, total: res.data.length }
  }));
}

// 获取分类列表（离线模式：从 category-with-article.json 读取）
export function readCategoryList() {
  return localResponse('/apis/category-with-article');
}

// 获取标签列表（离线模式：从 tag-with-article.json 读取）
export function readTagList() {
  return localResponse('/apis/tag-with-article');
}

// 获取网站信息
export function readWebsiteInfo() {
  return localResponse<WebsiteInfo>("/apis/website-info");
}

// 获取搜索标题列表
export function readSearchTitleList() {
  return localResponse('/apis/search-titles');
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