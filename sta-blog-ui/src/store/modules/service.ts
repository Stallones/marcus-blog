// src/store/modules/service.ts
import { defineStore } from "pinia"
import { ref } from "vue"
import { healthCheck } from "@/apis/website"
import { ApiResponse } from "@/types";
import { tr } from "element-plus/es/locale/index.mjs";

export const useServiceStore = defineStore("service", () => {
  // 后端服务是否可用
  const isServiceAvailable = ref(false)
  const afterCheckService = ref<boolean>(false)

  // 检查后端服务是否可用
  const checkService = async () => {
    try {
      const res = await healthCheck()
      if (res.code === 200) {
        isServiceAvailable.value = true
      }
    } catch (err) {
      isServiceAvailable.value = false
    }
    
    afterCheckService.value = true
  }

  // const requestOrRead = (request: () => Promise<any>, read: () => Promise<any>) => {
  //   if (isServiceAvailable.value) {
  //     return request()
  //   } else {
  //     return read()
  //   }
  // }

  const requestOrRead = <T, Args extends any[]>(
    requestFn: (...args: Args) => Promise<ApiResponse<T>>,
    readFn: (...args: Args) => Promise<ApiResponse<T>>,
    ...args: Args
  ): Promise<ApiResponse<T>> => {
    if (isServiceAvailable.value) {
      return requestFn(...args);
    } else {
      return readFn(...args);
    }
  };

  return {
    isServiceAvailable,
    afterCheckService,
    checkService,
    requestOrRead,
  };
});
