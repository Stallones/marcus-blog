import http from '@/utils/http'

const REAL_IP = '116.25.146.177'

/** 获取榜单 */
export const reqToplist = () => {
    return http({
        url: '/wapi/toplist/detail',
        params: { timestamp: Date.now(), realIP: REAL_IP }
    })
}

/** 获取榜单歌曲列表 */
export const reqTopDetaliList = (params: { id: number; limit: number; offset: number }) => {
    return http({
        url: '/wapi/playlist/track/all',
        params: { ...params, timestamp: Date.now(), realIP: REAL_IP }
    })
}

/** 获取歌曲详情 主要是播放地址 */
export const reqMusicDetail = (params: { id: number; level: string }) => {
    return http({
        url: '/wapi/song/url/v1',
        params: { ...params, timestamp: Date.now(), realIP: REAL_IP }
    })
}

/** 获取音乐的描述 */
export const reqMusicDescription = (id: number) => {
    return http({
        url: '/wapi/song/detail',
        params: { ids: id, timestamp: Date.now(), realIP: REAL_IP }
    })
}

/** 搜索 */
export const reqSearch = (keyWords: string) => {
    return http({
        url: '/wapi/search/suggest',
        params: { keywords: keyWords, timestamp: Date.now(), realIP: REAL_IP }
    })
}

/** 根据歌手搜索热门歌曲 */
export const reqSearchSingerHot = (params: { id: number; limit: number; offset: number }) => {
    return http({
        url: '/wapi/artist/top/song',
        params: { ...params, order: 'hot', timestamp: Date.now(), realIP: REAL_IP }
    })
}

/** 根据歌曲id获取歌词 */
export const reqMusicLyricById = (id: number) => {
    return http({
        url: '/wapi/lyric',
        params: { id, timestamp: Date.now(), realIP: REAL_IP }
    })
}
