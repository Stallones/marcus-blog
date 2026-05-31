# HTML 元素层级文档

> 以 `src/views/Layout/index.vue` 为入口，展开完整 DOM 树。
> 标注每个元素的 `position` / `z-index` / `display` / `height`，便于调试层级和布局问题。
> **最后更新：2026-05-27，基于当前源码重新生成。**

---

## 全局根层（`App.vue`）

```
html > body > #app
│
├── <router-view /> v-if="useService.afterCheckService"
│   → 渲染 Layout/index.vue（详见下方）
│
├── <Loading />
│   div.loading
│   ├─ position: fixed; top:0; left:0
│   ├─ width:100%; height:100%
│   ├─ z-index: 100
│   └─ display: flex; justify-content:center; align-items:center
│
├── <MusicAi />
│   悬浮音乐播放器
│   ├─ position: fixed
│   └─ z-index: 999（estimated）
│
├── <DevToolsBlocker :enableDevToolsBlocker="true" />
│   div.dev-tools-blocker（外有 <transition name="slide-down">）
│   ├─ position: fixed; top:0; left:0
│   ├─ width:100%
│   ├─ z-index: 10000
│   └─ pointer-events: none
│
├── <ContextMenu />
│   div.context-menu
│   ├─ position: fixed
│   ├─ z-index: 10000
│   └─ top/left 由内联 style 动态设置
│
└── <CanvasLayer :imageUrl="aaa" :headerHeight="headerHeight" />
     canvas.canvas-layer
     ├─ position: fixed; top:0; left:0
     ├─ width:100vw; height:100vh
     ├─ z-index: -1
     ├─ pointer-events: none
     ├─ headerHeight prop: 首页=0（Phase 1 渐入）, 文章页=0.5*innerH（始终满视口从 header 偏移起算）
     ├─ CONTENT_H: innerHeight + headerHeight（文章页=1.5*innerH，容纳偏移后的完整图像）
     └─ 渲染：离屏Canvas → scrollY+headerHeight 偏移截取 → 主Canvas
```

> **层叠上下文说明**：CanvasLayer（z:-1）→ Layout 内容（auto）→ Nav（z:10）→ Loading（z:100）→ MusicAi（z:999）→ BottomRightLayout（z:9999）→ DevToolsBlocker/ContextMenu（z:10000）。

---

## Layout 主结构（`src/views/Layout/index.vue`）

**重大重构**：不再有 `HomeHeader`/`PageHeader` 分离组件，不再有 `parallax-*` CSS 类。统一使用 `<Header>` 组件，通过 `headerType` prop 区分模式。

```
div.layout-shell  [scoped, min-height: 100vh, position: static]
│
├── <Header
│     :headerType="meta.headerType"     ← 'home' | 'page' | 'none'
│     :title="meta.title"
│     :subtitle="meta.subtitle"
│   />
│   → 详见 §A — Header 组件
│
├── main.layout-main  [display: flex; justify-content: center; margin: 3rem]
│   │  @media < 1200px → margin: 0
│   │
│   └── div.main-wrapper  [display: flex; justify-content: center; width: 100%]
│       │  padding-bottom: 2rem; min-height: calc(100vh - 50px)
│       │
│       ├── div.main-content  [flex: 3; padding: 1rem; margin: 1rem]
│       │   │  border-radius: 0.5em; box-shadow: 0 0 10px rgba(0,0,0,0.2)
│       │   │  @media < 910px → padding: 0.2rem
│       │   │
│       │   └── <router-view v-slot="{ Component, route: r }">
│       │         <transition name="el-fade-in-linear" mode="out-in">
│       │           <div :key="r.fullPath">
│       │             <component :is="Component" />
│       │           </div>
│       │         </transition>
│       │       </router-view>
│       │       │
│       │       │  根据路由渲染不同页面组件：
│       │       │  ├─ ''          → Home.vue              （§C）
│       │       │  ├─ '/article/:id' → Article.vue
│       │       │  ├─ '/timeline'    → TimeLine.vue
│       │       │  ├─ '/category/:id?' → Category.vue
│       │       │  ├─ '/tags/:id?'     → Tags.vue
│       │       │  ├─ '/tree-hole'     → TreeHole.vue
│       │       │  ├─ '/message'       → Message/index.vue
│       │       │  ├─ '/link'          → Link.vue
│       │       │  ├─ '/music'         → Music/index.vue
│       │       │  ├─ '/about'         → About.vue
│       │       │  ├─ '/photo'         → Photo/index.vue
│       │       │  ├─ '/setting'       → Setting.vue
│       │       │  └─ '/welcome/*'     → Welcome/index.vue (独立路由，非layout子路由)
│       │       │
│       └── div.main-sidebar  [flex: 1; v-if="showSidebar"]
│           │  padding: 1rem; margin: 1rem
│           │  @media < 910px → display: none
│           │  @media < 1200px → width: 30%
│           │
│           └── <SideBar />
│               → 详见 §D — SideBar 组件
│
├── <Footer v-if="meta.showFooter !== false" />
│   div.Footer
│   ├─ position: static; width:100%; height:50px
│   ├─ background: var(--mao-bg-footer)
│   └─ box-shadow: 0 0 10px 10px rgba(0,0,0,0.1)
│
└── <BottomRightLayout to-top />
     div.container_div
     ├─ position: fixed; bottom:4rem; right:2rem
     ├─ width:60px; height:auto
     ├─ z-index: 9999
     └─ display: flex; flex-direction:column
```

### meta 计算逻辑（Layout `<script setup>`）

```ts
const route = useRoute();
const meta = computed(() => ({
  headerType: (route.meta.headerType as string) || "page",  // 'home' | 'page' | 'none'
  showFooter: route.meta.showFooter !== false,
  title: (route.meta.title as string) || "",
  subtitle: (route.meta.subtitle as string) || "",
}));
const showSidebar = computed(() => route.matched.some((r) => r.meta.sidebar === true));
// sidebar 仅对 Home ('/') 和 Message ('/message') 显示
```

---

## §A — Header 组件（`src/components/Header/index.vue`）

**统一 Header**：合并了旧的 `HomeHeader.vue` 和 `PageHeader.vue`。通过 `headerType` prop 切换内容。

```
header  [动态 CSS class: home-header | page-header]
│  position: relative; width:100%; overflow:hidden
│
├── <Nav />  ← 所有页面共享（详见 §B）
│
├── div.hh-hero  [v-if="headerType === 'home'"  → 仅首页]
│   │  .hh-hero 无特殊定位，是 header 的普通子元素
│   │
│   ├── <Images />
│   │   div.imgs  [position: fixed; top:0; left:0]
│   │   ├─ width:100%; height:100vh
│   │   ├─ z-index: -2
│   │   ├─ background-color: #363636; overflow: hidden
│   │   └─ 内部：<ul> 内 5 张轮播图，30s 循环，每 6s 切换
│   │       └─ ::before overlay: rgba(0,0,0,0.2)
│   │
│   ├── <Brand />
│   │   div.brand-container  [position: relative; height:100vh]
│   │   │  display: flex; center center; flex-direction:column
│   │   │
│   │   ├── div.brand  [position: fixed; z-index: -1; top:15em]
│   │   │   ├─ <TextGlitch :text="..." />  → 网站标题 glitch 效果
│   │   │   └─ div.brand-text  → 打字机文本（调用 getSoupTyping）
│   │   │       └─ .title > .easy-typed-cursor (闪烁光标)
│   │   │
│   │   └── div.button-container  [position: absolute; bottom:15vh]
│   │       │  z-index: 8; cursor:pointer; @click="scrollDown"
│   │       ├─ SvgIcon.arrow-down (z-index:9, 上下抖动动画)
│   │       └─ div.button-ripple (涟漪 + 渐变色动画)
│   │
│   ├── <MouseTrail />
│   │   div.mouse-trail-container  [position: fixed; top:0; left:0]
│   │   ├─ width:100%; height:100%
│   │   ├─ pointer-events: none
│   │   └─ canvas (requestAnimationFrame 绘制彩色拖尾圆点)
│   │
│   └── <Particles />
│       div.particles-container  [position: fixed; top:0; left:0]
│       ├─ width:100%; height:100vh
│       ├─ pointer-events: none
│       └─ canvas (50 个粒子，鼠标排斥交互，粒子间连线)
│
├── [headerType==='none' → 无额外内容，仅 Nav]
│
└── div.hh-banner  [v-if="headerType === 'page'"  → 非首页]
    │  position: relative; height:50vh; width:100%  ← 入文档流，撑起 header 50vh
    │  display: flex; justify-content:center; flex-direction:column; align-items:center
    │  background-image: url("@/assets/images/forest.jpg")
    │  background-size: cover; background-position: center
    │
    ├── h2.title  (4.6rem 白色 3D 立体文字阴影)
    └── h3.subtitle > span  (1.6rem skew(-10deg) 半透明 + 阴影)
```

### Header class 映射

```ts
const headerClass = computed(() => {
  const map: Record<string, string> = {
    home: "home-header",   // position:relative; overflow:hidden
    page: "page-header",   // position:relative; overflow:hidden
  };
  return map[props.headerType] || "page-header";
});
```

> **注意**：`home-header` 和 `page-header` 的 CSS 完全相同（`position:relative; overflow:hidden`），差异仅在子元素 `.hh-hero` vs `.hh-banner`。

---

## §B — Nav 导航栏（`src/components/Nav/index.vue`）

### 桌面端导航（> 910px）

```
nav  [position: fixed; top:0; z-index:10; height:50px; width:100%]
│  display: flex; justify-content: space-evenly
│  background: var(--mao-nav-bg); backdrop-filter: blur(6px)
│  border-bottom: 1px solid var(--mao-nav-border)
│  transition: top 0.3s, background-color 0.3s
│
│  ★ 动态 class：
│    .hidden      → top: -50px（向下滚隐藏，向上滚显示）
│    .transparent → bg: transparent; backdrop-filter: none（滚动到顶部时透明）
│
│  @media < 910px → display: none（使用移动端 NavForMob）
│
├── #menu-left  [display: flex; flex:1; align-items:center; font-weight:bold]
│   ├── #blog-info  [flex:1; text-align:center]
│   │   └── <a href="/">{{ useWebsite.webInfo?.websiteName }}</a>
│   │
│   └── <NavList />  → 导航链接列表组件
│
└── #menu-right  [display: flex; flex:1; justify-content:flex-end; align-items:center]
    ├── <ColorModeToggle />    → 深色/浅色切换
    ├── <SearchByDB />         → 数据库搜索
    └── <UserLogin />          → 用户登录入口
```

### 移动端导航（≤ 910px）

```
div.mob-div
└── <NavForMob />
    → drawer 形式的移动端导航（含 NavList + SearchByDB + UserLogin）
```

### Nav 滚动行为

```ts
// 关键逻辑：首页滚动到顶部时透明，其他页面向下滚隐藏
const handleScroll = () => {
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const isHomePage = route.path === "/";

  // 首页顶部软透明
  if (currentScrollTop === 0 && isHomePage) {
    isTransparent.value = true;
  } else {
    // 向下滚动隐藏，向上显示
    isMenuHidden.value = currentScrollTop > lastScrollTop;
  }
  isTransparent.value = currentScrollTop === 0;
  lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
};
```

---

## §C — 首页结构（`src/views/Home.vue`）

```
div.home-content  [scoped, position:static]
│  @media < 910px → width:100vw
│
└── <Main :is-side-bar="true" />
    → 渲染 Home/Main/index.vue（内容 + 侧边栏插槽）
```

**Home/Main/index.vue** 使用 `Layout/Main/index.vue`：

```
div.div_container  [display:flex; justify-content:center; padding-bottom:2rem]
│  min-height: calc(100vh - 50px)
│
├── div.content_container  [flex:3; max-width:75rem]
│   └── <slot name="content" />
│       → 由 Home/Main/index.vue 填充：
│         ├─ 站点公告
│         ├─ 推荐文章列表
│         ├─ 离线搜索
│         └─ <CardEssay /> 文章列表
│
└── div.information_container  [flex:1; v-if="isSideBar"]
    └── <slot name="information" />
        → 用户信息、标签云等
```

---

## §D — SideBar 侧边栏（`src/components/Layout/SideBar/index.vue`）

```
div[style="padding-top: 50px"]  [scoped]
│
├── <UserInfo />
├── <Announcement />
├── <ElectronicClocks />
├── <RandomArticle />        [v-if="showRandom" → 服务可用时显示]
├── <TagListCard />
├── <ChargingList />
├── <DailySoup />
└── <WebsiteInfo />
```

> **显隐规则**：SideBar 仅在路由 meta 中 `sidebar: true` 的页面渲染（当前为 Home '/' 和 Message '/message'）。由 Layout 中的 `showSidebar` computed 控制。

---

## 全局层级刻度尺（所有 fixed 元素）

```
-2          Images (背景轮播，Header > .hh-hero 内)
-1          CanvasLayer (App 根级，滚动渐进显示图片)
-1          Brand.brand (品牌标题，Header 内 .hh-hero 内)
 0 (auto)   layout-shell, main-wrapper, main-content, Footer, .brand-container
 8          .button-container + .button-ripple + .arrow-down (Brand 内向下按钮)
10          Nav (导航栏)
100         Loading (全局加载遮罩)
~999        MusicAi (音乐播放器)
9999        BottomRightLayout (返回顶部按钮)
10000       DevToolsBlocker, ContextMenu (系统最高层)
```

> **注意**：
> 1. `.home-header` / `.page-header` 的 `position: relative` 创建独立层叠上下文。但其内部用 `position: fixed` 的元素（Images/Brand/MouseTrail/Particles/Nav）脱离该上下文，回到根级比较 z-index。
> 2. `.hh-banner` 为 `position: relative`（入文档流），撑起 `.page-header` 高度=50vh。不影响层级上下文。
> 3. Images (z:-2) 在 CanvasLayer (z:-1) 下面，首页轮播图在画布之下不可见时，会看到 CanvasLayer 的图片。
> 4. Brand.brand (z:-1) 与 CanvasLayer 同级 z-index，若品牌文字需要覆盖 Canvas 内容，需提高 z-index。
> 5. Nav (z:10) 始终在 CanvasLayer 和 Images 之上，不受其影响。
> 6. 响应式断点：910px（sidebar 隐藏、Nav 切换移动端）、1200px（layout margin 归零）。

---

## Header 高度 → layout-main 位移关系（布局关键）

> **为什么首页和文章页的 main 区起始位置不同？**

```
headerType "home" (路由 '/')：
  Header.home-header  [position:relative, height=auto ← 由子元素撑开]
    └── .hh-hero > .brand-container  [position:relative, height:100vh]  ← 文档流内，占 100vh
  → Header 实测高度 = 100vh
  → layout-main 起始 Y = 100vh + 3rem(margin)

headerType "page" (路由 '/article/:id' 等)：
  Header.page-header  [position:relative, height=auto ← 由子元素撑开]
    ├── Nav  [position:fixed → 脱离文档流, 贡献 0]
    └── .hh-banner  [position:relative, height:50vh]  ← 入文档流，占 50vh
  → Header 实测高度 = 50vh
  → layout-main 起始 Y = 50vh + 3rem(margin)

headerType "none" (路由 '/tree-hole' 等)：
  Header 仅渲染 Nav [position:fixed → 贡献 0]
  → Header 实测高度 = 0
  → layout-main 起始 Y = 3rem(margin)
```

### 对 CanvasLayer 的连锁影响

```
CanvasLayer 使用 window.scrollY * SPEED + headerHeight 决定显示画布哪一部分：

home 页 (headerHeight=0)：
  → 保持原有 Phase 1 渐入逻辑：scrollY=0 → 画布透明（hero Images 轮播可见）
  → scrollY ≥ innerHeight → Phase 2 → 画布填满并随滚动上移
  → 视觉效果：hero 区域由 Images(z:-2)+Brand(z:-1) 展示，内容区才渐入画布

page 页 (headerHeight=0.5*innerHeight)：
  → 走 header 分支：画布始终填满视口，sourceY = min(maxOrigin, scrollY + 0.5*innerH)
  → scrollY=0 → sourceY = 0.5*innerH → 画布从离屏 50vh 处开始显示
  → CONTENT_H = 1.5*innerH，maxOrigin = 0.5*innerH（滚动到头停住，形成视差效果）
  → 视觉效果：hh-banner 区域就有画布背景（而非空白），内容滚动时画布缓慢上移

关键：headerHeight 由 App.vue 通过 useRoute().meta.headerType 计算，
      路由切换时 watch(headerH) 触发 handleResize 重建离屏画布。
```
