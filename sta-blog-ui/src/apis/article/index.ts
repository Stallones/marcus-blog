import http from "@/utils/http.ts";
import { ApiResponse } from "@/types";

// 获取文章详细
export const getArticleDetail = (id: string) => {
  return http({
    url: `/article/detail/${id}`,
    method: "get",
  });
};

// 获取评论
export const getComment = (
  commentType: number,
  commentPId: number,
  pageNum: number,
  pageSize: number
) => {
  return http({
    url: "/comment/getComment",
    method: "get",
    params: {
      commentType,
      commentPId,
      pageNum,
      pageSize,
    },
  });
};

// 用户添加评论
export const addComment = (data: object) => {
  return http({
    url: "/comment/auth/add/comment",
    method: "post",
    data,
  });
};

// 时间轴
export const getTimeLine = () => {
  return http({
    url: "/article/timeLine",
    method: "get",
  });
};

// 查询不同类型下的文章列表
export const whereArticleList = (archiveType: string, archiveId: number) => {
  return http({
    url: "/article/archive",
    method: "get",
    params: { archiveType, archiveId },
  });
};

// 文章访问量+1
export function addArticleVisit(id: String): Promise<ApiResponse<any>> {
  return http.get(`/article/visit/${id}`, {
    method: "get",
  }) as Promise<ApiResponse<any>>;
}

// 获取初始化时标题搜索数据
export function getSearchTitleList(): Promise<ApiResponse<any>> {
  return http.get(`/article/search/init/title`, {
    method: "get",
  });
}

// 对内容进行文章搜索
export function searchArticleContent(
  content: String
): Promise<ApiResponse<any>> {
  return http.get("/article/search/by/content", {
    params: {
      content,
    },
    method: "get",
  }) as Promise<ApiResponse<any>>;
}

// 搜索热门推荐
export function getHotRecommend(): Promise<ApiResponse<any>> {
  return http.get(`/article/hot`, {
    method: "get",
  }) as Promise<ApiResponse<any>>;
}
