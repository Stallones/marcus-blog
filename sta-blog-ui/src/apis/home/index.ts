import http, { localResponse } from "@/utils/http.ts";
import { useServiceStore } from "@/store/modules/service";

// 获取首页文章列表
export function getArticleList(pageNum: Number, pageSize: Number) {
  const serviceMode = useServiceStore().serviceMode;
  switch (serviceMode) {
    case "on":
      return http({
        url: "/article/list",
        method: "get",
        params: {
          pageNum,
          pageSize,
        },
      });
    case "off":
      return localResponse<any[]>('/apis/article-list').then(res => ({
        ...res,
        data: { page: res.data, total: res.data.length }
      }));
  }
}

// 获取推荐文章列表
export function getRecommendArticleList() {
    return http({
        url: '/article/recommend',
        method: 'get'
    })
//   const serviceMode = useServiceStore().serviceMode;
//   switch (serviceMode) {
//     case "on":
//       return http({
//         url: "/article/recommend",
//         method: "get",
//       });

//     case "off":
//       return localResponse({ data: null });
//   }
}

// 获取随机文章
export function getRandomArticle() {
    return http({
        url: '/article/random',
        method: 'get'
    })
//   const serviceMode = useServiceStore().serviceMode;
//   switch (serviceMode) {
//     case "on":
//       return http({
//         url: "/article/random",
//         method: "get",
//       });

//     case "off":
//       return localResponse({ data: null });
//   }
}

// 相关推荐(按照分类)
export function getRelatedArticle(categoryId: string, articleId: string) {
  return http({
    url: `/article/related/${categoryId}/${articleId}`,
    method: "get",
  });
}
