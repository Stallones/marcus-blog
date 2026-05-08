import http, { localResponse } from "@/utils/http.ts";
import { useServiceStore } from "@/store/modules/service";

// 所有标签
export function tagList() {

    const serviceStore = useServiceStore();

    const serviceMode = serviceStore.serviceMode;
    
    switch (serviceMode) {

     case "on":  return http.get("/tag/list", {
        method: "get"
    });
    case "off": return localResponse('/apis/tags')
    
    }
}


