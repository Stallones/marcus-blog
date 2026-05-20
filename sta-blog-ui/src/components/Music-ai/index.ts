import axios from 'axios'

const MUSIC_API = import.meta.env.VITE_MUSIC_API || 'http://192.168.20.128:3000'
const REAL_IP = '116.25.146.177'

const musicHttp = axios.create({
    baseURL: MUSIC_API,
    timeout: 10000,
})

musicHttp.interceptors.response.use(
    (res) => res.data,
    (err) => Promise.reject(err)
)

/** 获取榜单 */
export const reqToplist = async () => {
    const res = await musicHttp.get('/toplist/detail', {
        params: { timestamp: Date.now(), realIP: REAL_IP }
    })
    return res
}

/** 获取榜单歌曲列表 */
export const reqTopDetaliList = async ({ id, limit, offset }) => {
    const res = await musicHttp.get('/playlist/track/all', {
        params: { id, limit, offset, timestamp: Date.now(), realIP: REAL_IP }
    })
    return res
}

/** 获取歌曲详情 主要是播放地址 */
export const reqMusicDetail = async ({ id, level }) => {
    const res = await musicHttp.get('/song/url/v1', {
        params: { id, level, timestamp: Date.now(), realIP: REAL_IP }
    })
    return res
}

/** 获取音乐的描述 */
export const reqMusicDescription = async (id) => {
    const res = await musicHttp.get('/song/detail', {
        params: { ids: id, timestamp: Date.now(), realIP: REAL_IP }
    })
    return res
}

/** 搜索 */
export const reqSearch = async (keyWords) => {
    const res = await musicHttp.get('/search/suggest', {
        params: { keywords: keyWords, timestamp: Date.now(), realIP: REAL_IP }
    })
    return res
}

/** 根据歌手搜索热门歌曲 */
export const reqSearchSingerHot = async ({ id, limit, offset }) => {
    const res = await musicHttp.get('/artist/top/song', {
        params: { id, offset, limit, order: 'hot', timestamp: Date.now(), realIP: REAL_IP }
    })
    return res
}

/** 根据歌曲id获取歌词 */
export const reqMusicLyricById = async (id) => {
    const res = await musicHttp.get('/lyric', {
        params: { id, timestamp: Date.now(), realIP: REAL_IP }
    })
    return res
}
