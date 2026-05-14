import http from "@/utils/http.ts";

/** 获取榜单 */
export const reqToplist = async () => {
    const res = await http.get("/wapi/toplist/detail", {});
    return res;
};

/** 获取榜单歌曲列表 */
export const reqTopDetaliList = async ({ id, limit, offset }) => {
    const res = await http.get(`/wapi/playlist/track/all?id=${id}&limit=${limit}&offset=${offset}`, {});
    return res;
};

/** 获取歌曲详情 主要是播放地址 */
export const reqMusicDetail = async ({ id, level }) => {
    const res = await http.get(`/wapi/song/url/v1?id=${id}&level=${level}`, {});
    return res;
};

// 获取音乐的描述
export const reqMusicDescription = async (id) => {
    const res = await http.get(`/wapi//song/detail?ids=${id}`, {});
    return res;
};

// 搜索
export const reqSearch = async (keyWords) => {
    const res = await http.get(`/wapi/search/suggest?keywords=${keyWords}`, {});
    return res;
};
// 根据歌手搜索热门歌曲
export const reqSearchSingerHot = async ({ id, limit, offset }) => {
    const res = await http.get(`/wapi/artist/top/song?id=${id}&offset=${offset}&limit=${limit}&order=hot`, {});
    return res;
};
// 根据歌曲id获取歌词
export const reqMusicLyricById = async (id) => {
    const res = await http.get(`/wapi/lyric?id=${id}`, {});
    return res;
};
