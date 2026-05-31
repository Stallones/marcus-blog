import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  reqToplist,
  reqTopDetaliList,
  reqMusicDetail,
  reqMusicDescription,
  reqMusicLyricById
} from './index'

const audio = new Audio()
audio.volume = 0.5
audio.preload = 'auto'
audio.crossOrigin = 'anonymous'

const LOCAL_TOP_ID = 'local'
const PAGE_SIZE = 20

/** 本地歌单的纯色封面（SVG data URI） */
const LOCAL_COVER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Crect width='90' height='90' fill='%236888AE' rx='8'/%3E%3Ctext x='45' y='48' fill='white' font-size='13' font-weight='700' text-anchor='middle'%3E本地音乐%3C/text%3E%3C/svg%3E`

/** 本地歌单项 */
const LOCAL_TOP_ITEM = { id: LOCAL_TOP_ID, name: '本地音乐', coverImgUrl: LOCAL_COVER }

/** 提取榜单核心字段 */
function pickTopFields(raw: any) {
  return { id: raw.id, name: raw.name, coverImgUrl: raw.coverImgUrl }
}

/** 提取歌曲核心字段 */
function pickSongFields(raw: any) {
  return {
    id: raw.id,
    name: raw.name,
    ar: raw.ar?.map((a: any) => ({ name: a.name })),
    al: raw.al ? { picUrl: raw.al.picUrl } : undefined,
    alia: raw.alia,
  }
}

/** 解析文件名 "歌手 - 歌名.ext" => { artist, name } */
function parseLocalFilename(filename: string) {
  const dotIdx = filename.lastIndexOf('.')
  const basename = dotIdx > 0 ? filename.slice(0, dotIdx) : filename
  const sep = ' - '
  const sepIdx = basename.indexOf(sep)
  if (sepIdx > 0) {
    return {
      artist: basename.slice(0, sepIdx).trim(),
      name: basename.slice(sepIdx + sep.length).trim(),
    }
  }
  return { artist: '未知', name: basename }
}

export const useMusicAiStore = defineStore('musicAi', () => {
  // ── 状态 ──
  const isPaused = ref(true)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.5)
  const playMode = ref<'LISTLOOP' | 'RANDOM' | 'SINGLECYCLE'>('LISTLOOP')

  const topList = ref<any[]>([])
  const currentTopId = ref<string | number | null>(null)
  const songList = ref<any[]>([])
  const isLoadingTop = ref(false)
  const isLoadingSongs = ref(false)

  const currentSongId = ref<string | number | null>(null)
  const currentSongUrl = ref('')
  const currentSongName = ref('')
  const currentSongArtist = ref('')
  const currentSongCover = ref('')
  const currentSongAlia = ref('')

  const localSongs = ref<any[]>([])

  // ── 分页状态 ──
  const songOffset = ref(0)
  const hasMore = ref(true)

  // ── 歌曲详情缓存（避免重复请求描述） ──
  const songDetailCache = new Map<number | string, any>()

  // ── 按榜单缓存歌曲列表（榜单ID → { songs, offset, hasMore }） ──
  const playlistSongCache = new Map<number | string, { songs: any[]; offset: number; hasMore: boolean }>()

  // ── 计算属性 ──
  const progress = computed(() => {
    if (!duration.value) return 0
    return Math.round((currentTime.value / duration.value) * 10000) / 100
  })

  const timeDisplay = computed(() => {
    const fmt = (t: number) => {
      const m = Math.floor(t / 60)
      const s = Math.floor(t % 60)
      return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`
    }
    return { current: fmt(currentTime.value), total: fmt(duration.value) }
  })

  const currentIndex = computed(() =>
    songList.value.findIndex((s) => s.id === currentSongId.value)
  )

  // ── Actions ──

  /** 读取本地音乐清单 */
  async function fetchLocalSongs() {
    try {
      const res = await fetch('/music/index.json')
      const files: string[] = await res.json()
      localSongs.value = files.map((file, idx) => {
        const { artist, name } = parseLocalFilename(file)
        return {
          id: `local-${idx}`,
          name,
          ar: [{ name: artist }],
          al: { picUrl: null },
          localUrl: `/music/${encodeURIComponent(file)}`,
        }
      })
    } catch {
      localSongs.value = []
    }
  }

  /** 加载排行榜列表（本地歌单始终在最前面） */
  async function fetchTopList() {
    // 先展示本地歌单
    topList.value = [LOCAL_TOP_ITEM]
    await fetchLocalSongs()
    if (localSongs.value.length) {
      currentTopId.value = LOCAL_TOP_ID
      songList.value = localSongs.value
    }

    try {
      const res = await reqToplist()
      if (res.code === 200) {
        const remote = (res.list || []).map(pickTopFields)
        topList.value = [LOCAL_TOP_ITEM, ...remote]

        if (!localSongs.value.length) {
          const hotIdx = remote.findIndex((t: any) => t.name.includes('热歌'))
          const defaultTop = remote[hotIdx > -1 ? hotIdx : 0]
          if (defaultTop && currentTopId.value !== defaultTop.id) {
            currentTopId.value = defaultTop.id
            await fetchSongsByTop(defaultTop.id)
          }
        }
      }
    } finally {
      isLoadingTop.value = false
    }
  }

  /** 根据榜单 id 加载歌曲列表（首次 20 首），有缓存则直接从缓存恢复 */
  async function fetchSongsByTop(id: number | string) {
    currentTopId.value = id as any

    if (id === LOCAL_TOP_ID) {
      songList.value = localSongs.value
      songOffset.value = localSongs.value.length
      hasMore.value = false
      return
    }

    // 已缓存 → 直接恢复，不重新请求
    const cached = playlistSongCache.get(id)
    if (cached) {
      songList.value = cached.songs
      songOffset.value = cached.offset
      hasMore.value = cached.hasMore
      return
    }

    // 未缓存 → 从 API 加载
    isLoadingSongs.value = true
    songList.value = []
    songOffset.value = 0
    hasMore.value = true
    try {
      const res = await reqTopDetaliList({ id: Number(id), limit: PAGE_SIZE, offset: 0 })
      if (res.code === 200) {
        const songs = (res.songs || []).map(pickSongFields)
        songList.value = songs
        songOffset.value = songs.length
        hasMore.value = songs.length >= PAGE_SIZE
        playlistSongCache.set(id, { songs, offset: songOffset.value, hasMore: hasMore.value })
      } else {
        hasMore.value = false
      }
    } finally {
      isLoadingSongs.value = false
    }
  }

  /** 滚动加载更多歌曲 */
  async function loadMoreSongs() {
    if (!hasMore.value || isLoadingSongs.value || currentTopId.value === LOCAL_TOP_ID || currentTopId.value == null) return

    const topId = currentTopId.value
    isLoadingSongs.value = true
    try {
      const res = await reqTopDetaliList({ id: Number(topId), limit: PAGE_SIZE, offset: songOffset.value })
      if (res.code === 200) {
        const songs = (res.songs || []).map(pickSongFields)
        songList.value.push(...songs)
        songOffset.value += songs.length
        hasMore.value = songs.length >= PAGE_SIZE
        // 同步更新缓存
        playlistSongCache.set(topId, { songs: songList.value.slice(), offset: songOffset.value, hasMore: hasMore.value })
      } else {
        hasMore.value = false
      }
    } finally {
      isLoadingSongs.value = false
    }
  }

  /** 播放指定歌曲 */
  async function playSong(id: number | string) {
    if (!id) return
    currentSongId.value = id as any

    // 本地点播 —— 跳过 API
    const localSong = songList.value.find((s) => s.id === id && s.localUrl)
    if (localSong) {
      currentSongName.value = localSong.name || ''
      currentSongArtist.value = localSong.ar?.[0]?.name || '未知歌手'
      currentSongCover.value = ''
      currentSongAlia.value = ''
      currentSongUrl.value = localSong.localUrl
      audio.src = localSong.localUrl
      await audio.play()
      isPaused.value = false
      return
    }

    // 远程点播 —— 优先从缓存取详情（id 此时一定是 number）
    const numId = id as number
    let cached = songDetailCache.get(numId)
    if (!cached) {
      const desc = await reqMusicDescription(numId)
      if (desc?.code === 200 && desc.songs?.[0]) {
        cached = desc.songs[0]
        songDetailCache.set(numId, cached)
      }
    }
    if (cached) {
      currentSongName.value = cached.name || ''
      currentSongArtist.value = cached.ar?.[0]?.name || '未知歌手'
      currentSongCover.value = cached.al?.picUrl || ''
      currentSongAlia.value = cached.alia?.[0] || ''
    }

    const detail = await reqMusicDetail({ id: numId, level: 'exhigh' })
    if (detail?.code === 200 && detail.data?.[0]?.url) {
      currentSongUrl.value = detail.data[0].url
      audio.src = detail.data[0].url
      await audio.play()
      isPaused.value = false
    }
  }

  /** 切换 播放/暂停 */
  function togglePlay() {
    if (!currentSongId.value && songList.value.length) {
      playSong(songList.value[0].id)
      return
    }
    if (isPaused.value) {
      audio.play().then(() => { isPaused.value = false }).catch(console.warn)
    } else {
      audio.pause()
      isPaused.value = true
    }
  }

  /** 上一首 / 下一首 */
  function skip(forward: boolean) {
    const len = songList.value.length
    if (!len || currentIndex.value < 0) return
    let idx = currentIndex.value
    if (playMode.value === 'RANDOM') {
      let n = Math.floor(Math.random() * len)
      while (n === idx && len > 1) n = Math.floor(Math.random() * len)
      idx = n
    } else {
      idx = forward
        ? (idx + 1) % len
        : (idx - 1 + len) % len
    }
    playSong(songList.value[idx].id)
  }

  function next() { skip(true) }
  function prev() { skip(false) }

  /** 切换播放模式 */
  function cyclePlayMode() {
    const modes: Array<'LISTLOOP' | 'RANDOM' | 'SINGLECYCLE'> = ['LISTLOOP', 'RANDOM', 'SINGLECYCLE']
    const i = modes.indexOf(playMode.value)
    playMode.value = modes[(i + 1) % modes.length]
  }

  /** 设置进度 */
  function seek(percent: number) {
    if (!duration.value) return
    const t = (percent / 100) * duration.value
    audio.currentTime = t
    currentTime.value = t
  }

  /** 设置音量 */
  function setVolume(v: number) {
    volume.value = Math.max(0, Math.min(1, v))
    audio.volume = volume.value
  }

  /** 切换面板后初始化音频事件（只需绑定一次） */
  let _initialized = false
  function initAudioEvents() {
    if (_initialized) return
    _initialized = true
    audio.ontimeupdate = () => {
      currentTime.value = audio.currentTime
      duration.value = audio.duration || 0
    }
    audio.onended = () => {
      if (playMode.value === 'SINGLECYCLE') {
        audio.currentTime = 0
        audio.play().catch(console.warn)
      } else {
        next()
      }
    }
    audio.onpause = () => { isPaused.value = true }
    audio.onplay = () => { isPaused.value = false }
    audio.onerror = () => { isPaused.value = true }
  }

  return {
    // state
    isPaused, currentTime, duration, volume, playMode,
    topList, currentTopId, songList,
    isLoadingTop, isLoadingSongs,
    currentSongId, currentSongUrl, currentSongName,
    currentSongArtist, currentSongCover, currentSongAlia,
    // pagination
    hasMore,
    // computed
    progress, timeDisplay, currentIndex,
    // actions
    fetchTopList, fetchSongsByTop, loadMoreSongs, playSong,
    togglePlay, next, prev, cyclePlayMode,
    seek, setVolume, initAudioEvents,
    audio,
  }
})
