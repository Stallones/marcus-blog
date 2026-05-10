import { defineStore } from "pinia";
import { shallowRef } from "vue";
import WebsiteInfo from "@/apis/website/type.ts";
import { returnTime } from "@/utils/tool.ts";
import { ArticleSearch } from "@/apis/article/type.ts";
import { readWebsiteInfo } from "@/utils/file-reader";
import { useServiceStore } from "@/store/modules/service";
import { getWebsiteInfo } from "@/apis/website";
import { getSearchTitleList } from "@/apis/article";

const useWebsiteStore = defineStore("website", () => {
  const webInfo = shallowRef<WebsiteInfo>();
  // 标题搜索数据
  const searchTitle = shallowRef<Array<ArticleSearch>>();

  const useService = useServiceStore();

  // 获取网站信息
  const getInfo = async () => {
    const res = await useService.requestOrRead(getWebsiteInfo, readWebsiteInfo);
    res.data.lastUpdateTime = returnTime(res.data.lastUpdateTime) as string;
    webInfo.value = res.data;
  };

  // 获取网站文章标题搜索数据
  const getArticleTitleList = async () => {
    const res = await getSearchTitleList();
    searchTitle.value = res.data;
  };

  return {
    webInfo,
    getInfo,
    searchTitle,
    getArticleTitleList,
  };
});

export default useWebsiteStore;
