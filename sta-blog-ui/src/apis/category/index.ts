import http, { localResponse } from "@/utils/http.ts";
import { useServiceStore } from "@/store/modules/service";

// 查询分类列表
export function categoryList() {

    const serviceStore = useServiceStore();
    const serviceMode = serviceStore.serviceMode;

    switch (serviceMode) {
        case "on": return http.get("/category/list", {
            method: "get"
        });
        case "off": return localResponse('/apis/categories')
    }
}