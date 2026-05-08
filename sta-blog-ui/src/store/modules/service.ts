// src/store/modules/service.ts
import {defineStore} from "pinia";
import {ref} from "vue";
import {healthCheck} from "@/apis/website";

export const useServiceStore = defineStore('service', () => {
  // 后端服务是否可用
  const isServiceAvailable = ref(false)
  // 服务模式：'off' | 'on'
  const serviceMode = ref<'off' | 'on'>('off')

  // 检查后端服务是否可用
  const checkService = async() => {
    try {
      const res = await healthCheck()
      if (res.code === 200) {      
        isServiceAvailable.value = true
        serviceMode.value = 'on'
      }
    } catch (err) {
      isServiceAvailable.value = false
      serviceMode.value = 'off'
    } 
  }

  return {
    isServiceAvailable,
    serviceMode,
    checkService
  }
})