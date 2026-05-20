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

export const useMusicAiStore = defineStore('musicAi', () => {
  // ── 状态 ──
  const isPaused = ref(true)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.5)
  const playMode = ref<'LISTLOOP' | 'RANDOM' | 'SINGLECYCLE'>('LISTLOOP')

  const topList = ref<any[]>([])
  const currentTopId = ref<number | null>(null)
  const songList = ref<any[]>([])
  const isLoadingTop = ref(false)
  const isLoadingSongs = ref(false)

  const currentSongId = ref<number | null>(null)
  const currentSongUrl = ref('')
  const currentSongName = ref('')
  const currentSongArtist = ref('')
  const currentSongCover = ref('')
  const currentSongAlia = ref('')

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

  /** 加载排行榜列表 */
  async function fetchTopList() {
    isLoadingTop.value = true
    try {
      const res = await reqToplist()
      if (res.code === 200) {
        topList.value = res.list || []
        // 默认选中云音乐热歌榜（通常 index=3）
        const hotIdx = topList.value.findIndex((t: any) => t.name.includes('热歌'))
        const defaultTop = topList.value[hotIdx > -1 ? hotIdx : 0]
        if (defaultTop && currentTopId.value !== defaultTop.id) {
          currentTopId.value = defaultTop.id
          await fetchSongsByTop(defaultTop.id)
        }
      }
    } finally {
      isLoadingTop.value = false
    }
  }

  /** 根据榜单 id 加载歌曲列表（前 10 首） */
  async function fetchSongsByTop(id: number | string) {
    currentTopId.value = Number(id)
    isLoadingSongs.value = true
    songList.value = []
    try {
      const res = await reqTopDetaliList({ id: currentTopId.value, limit: 10, offset: 0 })
      if (res.code === 200) {
        songList.value = res.songs || []
      }
    } finally {
      isLoadingSongs.value = false
    }
  }

  /** 播放指定歌曲 */
  async function playSong(id: number) {
    if (!id) return
    currentSongId.value = id

    // 获取歌曲详情（封面、歌名等）
    const desc = await reqMusicDescription(id)
    if (desc?.code === 200 && desc.songs?.[0]) {
      const s = desc.songs[0]
      currentSongName.value = s.name || ''
      currentSongArtist.value = s.ar?.[0]?.name || '未知歌手'
      currentSongCover.value = s.al?.picUrl || ''
      currentSongAlia.value = s.alia?.[0] || ''
    }

    // 获取播放地址
    const detail = await reqMusicDetail({ id, level: 'exhigh' })
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
    // computed
    progress, timeDisplay, currentIndex,
    // actions
    fetchTopList, fetchSongsByTop, playSong,
    togglePlay, next, prev, cyclePlayMode,
    seek, setVolume, initAudioEvents,
    audio,
  }
})
