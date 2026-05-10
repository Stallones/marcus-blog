import http from "@/utils/http.ts";

// 获取服务状态
export function healthCheck() {
  return http({
    url: "/websiteInfo/health",
    method: "get",
  });
}

// 获取网站信息
export function getWebsiteInfo() {
  return http({
    url: "/websiteInfo/front",
    method: "get",
  });
}

// 查询banner列表
export async function backGetBanners() {
  return http({
    url: "/banners/list",
    method: "get",
  });
}
