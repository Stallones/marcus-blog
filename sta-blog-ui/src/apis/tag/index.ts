import http from "@/utils/http.ts";

// 所有标签
export function tagList() {
  return http({
    url: "/tag/list",
    method: "get",
  });
}
