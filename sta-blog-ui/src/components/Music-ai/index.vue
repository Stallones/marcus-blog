<template>
  <!-- 浮窗 + 面板容器 -->
  <div class="music-ai-root" @click.stop>
    <!-- 遮罩层 -->
    <Transition name="overlay-fade">
      <div v-if="isPanelOpen" class="overlay" @click="isPanelOpen = false"></div>
    </Transition>

    <!-- 浮窗迷你播放器 -->
    <div
      class="mini-player"
      :class="{ 'has-song': !!currentSongId }"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
      @click="togglePanel"
    >
      <div class="cover-wrapper">
        <img
          :src="currentSongCover || placeholderImg"
          class="cover-img"
          :class="{ rotating: !isPaused && !!currentSongId, paused: isPaused || !currentSongId, hover: isHovering }"
          alt="cover"
        />
        <div class="glow" :class="{ active: isHovering }"></div>
      </div>
      <div class="status-dot" :class="{ playing: !isPaused && !!currentSongId }"></div>
    </div>

    <!-- 展开面板（居中） -->
    <Transition name="panel-zoom">
      <div v-if="isPanelOpen" class="music-panel" @click.stop>
        <div class="panel-layout">
          <!-- 左侧：榜单 -->
          <div class="panel-left">
            <div class="panel-left-inner">
              <div class="section-title sticky-title">榜单</div>
              <TransitionGroup name="top-fade" tag="div" class="top-grid">
                <div
                  v-for="top in store.topList"
                  :key="top.id"
                  class="top-item"
                  :class="{ active: store.currentTopId === top.id }"
                  @click="switchTop(top)"
                >
                  <img :src="top.coverImgUrl" :alt="top.name" class="top-cover" />
                </div>
              </TransitionGroup>
            </div>
          </div>

          <!-- 右侧：歌曲列表 -->
          <div class="panel-right">
            <div class="panel-right-inner">
              <div class="section-title sticky-title">
                歌曲列表
                <span class="song-count" v-if="store.songList.length">({{ store.songList.length }})</span>
              </div>
              <div class="song-list" @scroll="onSongListScroll">
                <div
                  v-for="(song, idx) in store.songList"
                  :key="song.id"
                  class="song-item"
                  :class="{ active: store.currentSongId === song.id }"
                  @click="store.playSong(song.id)"
                >
                  <span class="song-idx">{{ idx + 1 }}</span>
                  <img :src="song.al?.picUrl" class="song-cover" v-if="song.al?.picUrl" />
                  <div class="song-info">
                    <div class="song-name">
                      {{ song.name }}
                      <span class="song-alia" v-if="song.alia?.[0]"> - {{ song.alia[0] }}</span>
                    </div>
                    <div class="song-artist">{{ song.ar?.[0]?.name || '未知' }}</div>
                  </div>
                  <div class="song-active-indicator" v-if="store.currentSongId === song.id">
                    <span></span><span></span><span></span>
                  </div>
                </div>
                <div v-if="store.isLoadingSongs && store.songList.length" class="load-more-hint">
                  加载中...
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部控制条 -->
        <div class="control-bar">
          <div class="progress-wrap">
            <div class="progress-track" @click="onProgressClick">
              <div class="progress-fill" :style="{ width: store.progress + '%' }"></div>
              <div class="progress-thumb" :style="{ left: store.progress + '%' }"></div>
            </div>
          </div>

          <div class="controls-row">
            <!-- 左侧：歌名 + 歌手 -->
            <div class="ctrl-left">
              <div class="song-meta" v-if="currentSongName">
                <div class="meta-name">{{ currentSongName }}</div>
                <div class="meta-artist">{{ currentSongArtist }}</div>
              </div>
              <div class="song-meta placeholder" v-else>
                <div class="meta-name">点击开始享受音乐</div>
              </div>
            </div>

            <!-- 中间：播放控制 -->
            <div class="ctrl-center">
              <button class="ctrl-btn" @click="store.prev" title="上一首">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
              <button class="ctrl-btn play-btn" @click="store.togglePlay" title="播放/暂停">
                <svg v-if="store.isPaused || !store.currentSongId" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
              </button>
              <button class="ctrl-btn" @click="store.next" title="下一首">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            </div>

            <!-- 右侧：模式 + 音量 + 时间 -->
            <div class="ctrl-right">
              <button class="ctrl-btn" @click="store.cyclePlayMode" :title="modeLabel">
                <svg v-if="store.playMode === 'LISTLOOP'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
                <svg v-else-if="store.playMode === 'RANDOM'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </button>
              <div class="volume-wrap">
                <button class="ctrl-btn" @click="toggleMute">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/></svg>
                </button>
                <input
                  type="range"
                  class="volume-slider"
                  min="0" max="1" step="0.05"
                  :value="store.volume"
                  @input="store.setVolume(Number(($event.target as HTMLInputElement).value))"
                />
              </div>
              <span class="time-text">{{ store.timeDisplay.current }} / {{ store.timeDisplay.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMusicAiStore } from './musicStore'
import blogAvatar from '@/assets/images/blogAvatar.svg'

const store = useMusicAiStore()
const isPanelOpen = ref(false)
const isHovering = ref(false)
const wasMuted = ref(false)
const previousVolume = ref(0.5)

const placeholderImg = blogAvatar
const { currentSongName, currentSongArtist, currentSongCover, currentSongId, isPaused } = storeToRefs(store)

const modeLabel = computed(() => {
  const map = { LISTLOOP: '列表循环', RANDOM: '随机播放', SINGLECYCLE: '单曲循环' }
  return map[store.playMode]
})

function togglePanel() {
  isPanelOpen.value = !isPanelOpen.value
  if (isPanelOpen.value) {
    store.initAudioEvents()
    if (!store.topList.length) {
      store.fetchTopList()
    }
  }
}

function switchTop(top: any) {
  if (store.currentTopId !== top.id) {
    store.fetchSongsByTop(top.id)
  }
}

function onProgressClick(e: MouseEvent) {
  const track = e.currentTarget as HTMLElement
  const rect = track.getBoundingClientRect()
  const pct = ((e.clientX - rect.left) / rect.width) * 100
  store.seek(pct)
}

function toggleMute() {
  if (store.volume > 0) {
    previousVolume.value = store.volume
    store.setVolume(0)
    wasMuted.value = true
  } else {
    store.setVolume(wasMuted.value ? previousVolume.value : 0.5)
    wasMuted.value = false
  }
}

function onSongListScroll(e: Event) {
  const el = e.currentTarget as HTMLElement
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 60) {
    store.loadMoreSongs()
  }
}
</script>

<style scoped lang="scss">
// ── 变量 ──
$neon-cyan: #00f0ff;
$neon-purple: #a855f7;
$bg-dark: rgba(10, 10, 26, 0.92);
$card-bg: rgba(18, 18, 40, 0.85);
$border-glow: rgba(0, 240, 255, 0.3);
$text-primary: #e2e8f0;
$text-secondary: #94a3b8;
$radius: 12px;

// ── 根容器 ──
.music-ai-root {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 2002;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
}

// ══════════════════════════════════════
//  遮罩
// ══════════════════════════════════════
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 2002;
}

.overlay-fade-enter-active { animation: fade-in 0.25s ease-out; }
.overlay-fade-leave-active { animation: fade-in 0.2s ease-in reverse; }
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

// ══════════════════════════════════════
//  迷你浮窗
// ══════════════════════════════════════
.mini-player {
  position: relative;
  width: 56px;
  height: 56px;
  margin: 0 0 20px 20px;
  cursor: pointer;
  border-radius: 50%;
  background: $card-bg;
  backdrop-filter: blur(16px);
  border: 1.5px solid $border-glow;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.15), 0 4px 20px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:hover {
    border-color: $neon-cyan;
    box-shadow: 0 0 30px rgba(0, 240, 255, 0.3), 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  &.has-song {
    border-color: $neon-cyan;
  }
}

.cover-wrapper {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transition: transform 0.4s ease;

  &.rotating { animation: spin 12s linear infinite; }
  &.paused { animation-play-state: paused; }
  &.hover { transform: scale(1.1); }
}

.glow {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: all 0.3s;

  &.active {
    border-color: $neon-cyan;
    box-shadow: 0 0 16px rgba(0, 240, 255, 0.5), inset 0 0 12px rgba(0, 240, 255, 0.15);
  }
}

.status-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.6);
  box-shadow: 0 0 4px rgba(148, 163, 184, 0.4);
  transition: all 0.3s;

  &.playing {
    background: $neon-cyan;
    box-shadow: 0 0 8px $neon-cyan;
    animation: pulse-dot 1.5s ease-in-out infinite;
  }
}

// ══════════════════════════════════════
//  面板（居中）
// ══════════════════════════════════════
.music-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  max-height: 580px;
  background: $bg-dark;
  backdrop-filter: blur(24px);
  border: 1px solid $border-glow;
  border-radius: $radius;
  box-shadow: 0 0 60px rgba(0, 240, 255, 0.12), 0 8px 40px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2003;
}

// ── 布局 ──
.panel-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: $neon-cyan;
  letter-spacing: 1px;
  padding: 16px 16px 10px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;

  .song-count {
    color: $text-secondary;
    font-weight: 400;
    font-size: 12px;
  }
}

.sticky-title {
  position: sticky;
  top: 0;
  z-index: 2;
  background: $bg-dark;
  backdrop-filter: blur(24px);
}

.loading-mask {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(0, 240, 255, 0.2);
  border-top-color: $neon-cyan;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

// ══════════════════════════════════════
//  左侧：榜单（55%）
// ══════════════════════════════════════
.panel-left {
  width: 55%;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-left-inner {
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 240, 255, 0.2) transparent;
}

.top-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding: 4px 12px 12px;
}

.top-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 3px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;

  &:hover {
    background: rgba(0, 240, 255, 0.08);
    border-color: rgba(0, 240, 255, 0.2);
    transform: translateY(-1px);
  }

  &.active {
    background: rgba(0, 240, 255, 0.1);
    border-color: $neon-cyan;
    box-shadow: 0 0 12px rgba(0, 240, 255, 0.15);
  }

  .top-cover {
    width: 90px;
    height: 90px;
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .top-name {
    font-size: 10px;
    color: $text-secondary;
    text-align: center;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// ══════════════════════════════════════
//  右侧：歌曲列表（45%）
// ══════════════════════════════════════
.panel-right {
  width: 45%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-right-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.song-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 240, 255, 0.2) transparent;
  padding: 4px 0;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 2px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  &.active {
    background: rgba(0, 240, 255, 0.06);
    border-left-color: $neon-cyan;
  }

  .song-idx {
    width: 18px;
    text-align: center;
    font-size: 11px;
    color: $text-secondary;
    flex-shrink: 0;
  }

  .song-cover {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .song-info {
    flex: 1;
    min-width: 0;
  }

  .song-name {
    font-size: 12px;
    color: $text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .song-alia {
      font-size: 10px;
      color: $text-secondary;
    }
  }

  .song-artist {
    font-size: 10px;
    color: $text-secondary;
    margin-top: 1px;
  }

  .song-active-indicator {
    display: flex;
    gap: 2px;
    align-items: center;
    flex-shrink: 0;

    span {
      display: block;
      width: 2px;
      height: 10px;
      background: $neon-cyan;
      border-radius: 1px;
      animation: eq-bar 0.8s ease-in-out infinite alternate;

      &:nth-child(2) { animation-delay: 0.2s; height: 14px; }
      &:nth-child(3) { animation-delay: 0.4s; }
    }
  }
}

// ══════════════════════════════════════
//  底部控制条
// ══════════════════════════════════════
.control-bar {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 8px 18px 12px;
}

.progress-wrap {
  padding: 0 0 8px;
}

.progress-track {
  position: relative;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    height: 4px;
    .progress-thumb { opacity: 1; }
  }
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $neon-cyan, $neon-purple);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: $neon-cyan;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
  box-shadow: 0 0 6px $neon-cyan;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// ── 左侧：歌名 + 歌手 ──
.ctrl-left {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  max-width: 240px;
}

.song-meta {
  min-width: 0;

  .meta-name {
    font-size: 13px;
    color: $text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }

  .meta-artist {
    font-size: 11px;
    color: $text-secondary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
  }

  &.placeholder .meta-name {
    color: $text-secondary;
    font-weight: 400;
  }
}

// ── 中间：控制 ──
.ctrl-center {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

// ── 右侧：模式 + 音量 + 时间 ──
.ctrl-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: flex-end;
}

.ctrl-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: $text-secondary;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: $neon-cyan;
  }

  &:active { transform: scale(0.92); }
}

.play-btn {
  width: 38px;
  height: 38px;
  background: rgba(0, 240, 255, 0.15);
  color: $neon-cyan;

  &:hover {
    background: rgba(0, 240, 255, 0.25);
    box-shadow: 0 0 16px rgba(0, 240, 255, 0.3);
  }
}

.time-text {
  font-size: 11px;
  color: $text-secondary;
  font-family: 'Share Tech Mono', 'Courier New', monospace;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.volume-wrap {
  display: flex;
  align-items: center;
  gap: 4px;

  .volume-slider {
    width: 50px;
    height: 3px;
    appearance: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    outline: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
      appearance: none;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: $neon-cyan;
      cursor: pointer;
      box-shadow: 0 0 4px $neon-cyan;
    }

    &::-moz-range-thumb {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: $neon-cyan;
      border: none;
      cursor: pointer;
    }
  }
}

// ══════════════════════════════════════
//  动画
// ══════════════════════════════════════
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

@keyframes eq-bar {
  from { height: 6px; }
  to { height: 14px; }
}

// ── 面板缩放动画 ──
.panel-zoom-enter-active {
  animation: zoom-in 0.25s ease-out;
}
.panel-zoom-leave-active {
  animation: zoom-in 0.2s ease-in reverse;
}

@keyframes zoom-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.88);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

// ══════════════════════════════════════
//  榜单 TransitionGroup 动画
// ══════════════════════════════════════
.top-fade-enter-active {
  animation: top-in 0.25s ease-out both;
}
.top-fade-leave-active {
  animation: top-in 0.15s ease-in reverse both;
}

// nth-child 实现错位动画（本地是第1个，远程从第2个开始依次进入）
.top-fade-enter-active:nth-child(2)  { animation-delay: 0s; }
.top-fade-enter-active:nth-child(3)  { animation-delay: 0.05s; }
.top-fade-enter-active:nth-child(4)  { animation-delay: 0.1s; }
.top-fade-enter-active:nth-child(5)  { animation-delay: 0.15s; }
.top-fade-enter-active:nth-child(6)  { animation-delay: 0.2s; }
.top-fade-enter-active:nth-child(7)  { animation-delay: 0.25s; }
.top-fade-enter-active:nth-child(8)  { animation-delay: 0.3s; }
.top-fade-enter-active:nth-child(9)  { animation-delay: 0.35s; }
.top-fade-enter-active:nth-child(10) { animation-delay: 0.4s; }
.top-fade-enter-active:nth-child(11) { animation-delay: 0.45s; }
.top-fade-enter-active:nth-child(12) { animation-delay: 0.5s; }
.top-fade-enter-active:nth-child(13) { animation-delay: 0.55s; }

@keyframes top-in {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(6px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/** 榜单区域固定高度，避免请求未返回时组件没高度 */
.panel-left-inner {
  min-height: 380px;
}

/** 滚动加载提示 */
.load-more-hint {
  text-align: center;
  padding: 12px;
  font-size: 11px;
  color: $text-secondary;
}

// ── 响应式 ──
@media (max-width: 880px) {
  .music-panel {
    width: 94vw;
    max-height: 85vh;
  }
}

@media (max-width: 640px) {
  .panel-left {
    display: none;
  }

  .panel-right {
    width: 100%;
  }

  .music-panel {
    width: 96vw;
  }
}
</style>
