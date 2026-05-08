import http, { localResponse } from "@/utils/http.ts";
import WebsiteInfo from "@/apis/website/type.ts";
import { useServiceStore } from "@/store/modules/service";
import { bannerImages } from "@/utils/banner-images";
import type { ApiResponse } from "@/types";

// 获取服务状态
export function healthCheck() {
  return http({
        url: "/websiteInfo/health",
        method: "get",
      })
}

// 获取网站信息
export function getWebsiteInfo(): Promise<ApiResponse<WebsiteInfo>> {
  const serviceStore = useServiceStore();
  const serviceMode = serviceStore.serviceMode;

  switch (serviceMode) {
    case "on":
      return http({
        url: "/websiteInfo/front",
        method: "get",
      }) as Promise<ApiResponse<WebsiteInfo>>;
    case "off":
      return localResponse<WebsiteInfo>("/apis/website-info");
  }
}

// 查询banner列表
export async function backGetBanners() {
  const serviceStore = useServiceStore();
  const serviceMode = serviceStore.serviceMode;

  switch (serviceMode) {
    case "on":
      return http({
        url: "/banners/list",
        method: "get",
      });
    case "off":
      return Promise.resolve({ code: 200, msg: "success", data: bannerImages });
  }
}
