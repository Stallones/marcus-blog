# Route → Component Hierarchy

> From `src/router/routers.ts` to rendered component tree.
> Shows how URL path resolves to the full DOM tree.
> **Bold** = shared components used by multiple routes (modify with caution).
> **Last updated: 2026-05-27 — unified Header architecture**

## Root: App.vue → Layout

```
App.vue
├── <router-view v-if="afterCheckService" /> → Layout/index.vue
├── <Loading />                             **全局**
├── <MusicAi />                             **全局**
├── <DevToolsBlocker />                     **全局**
├── <ContextMenu />                         **全局**
└── <CanvasLayer :imageUrl="..." />         **全局: z:-1, fixed**
```

## Layout/index.vue (unified — no more HomeHeader/PageHeader split)

```
div.layout-shell
├── <Header :headerType="meta.headerType" :title="..." :subtitle="..." />
│   → §A — unified Header (decides home vs page content internally)
│
├── main.layout-main
│   └── div.main-wrapper
│       ├── div.main-content
│       │   └── <router-view v-slot="{ Component, route: r }">
│       │       → (page component based on route)
│       │
│       └── div.main-sidebar  v-if="showSidebar"
│           └── <SideBar />
│
├── <Footer v-if="meta.showFooter !== false" />   **全局**
└── <BottomRightLayout to-top />                   **全局浮动**
```

## Route Table

| Path | View Component | headerType | sidebar | off-footer | offline-mode |
|------|---------------|------------|---------|------------|-------------|
| `/` | `Home.vue` → `Home/Main/index.vue` | `home` | ✅ | ✅ | B+C |
| `/article/:id` | `Article.vue` | `page` | — | ✅ | B |
| `/timeline` | `Pigeonhole/TimeLine.vue` | `page` | — | ✅ | A |
| `/category/:id?` | `Pigeonhole/Category.vue` | `page` | — | ✅ | A |
| `/tags/:id?` | `Pigeonhole/Tags.vue` | `page` | — | ✅ | A |
| `/tree-hole` | `Amusement/TreeHole.vue` | `none` | — | — | C+UI |
| `/message` | `Amusement/Message/index.vue` | `page` | ✅ | ✅ | C |
| `/message/detail/:id?` | `Amusement/Message/MessageDetail.vue` | `page` | — | ✅ | C |
| `/link` | `Link.vue` | `page` | — | ✅ | C |
| `/music` | `Music/index.vue` | `page` | — | ✅ | D |
| `/photo` | `Photo/index.vue` | `page` | — | ✅ | D |
| `/about` | `About.vue` | `page` | — | ✅ | — |
| `/setting` | `Setting.vue` | `page` | — | ✅ | — |
| `/welcome/*` | `Welcome/index.vue` (独立路由，非layout子路由) | `none` | — | — | — |

> **Offline modes**: A=requestOrRead降级(无感), B=requestOrRead+isServiceAvailable门控, C=直接API+门控(离线禁用), D=无离线处理. 详见 TECHNICAL-INDEX.md.

## Page-Specific Component Trees

### Home `/` (headerType: home)

```
Home.vue
└── <Main :is-side-bar="true" />  ← Home/Main/index.vue
    └── <Main />                   ← Layout/Main/index.vue
        ├── content slot:
        │   ├── <Announcement />
        │   ├── <OfflineSearch />          v-if="!useService.isServiceAvailable"
        │   ├── <RecommendArticle />
        │   ├── <OfflineSearch />          v-if="!useService.isServiceAvailable"
        │   └── <CardEssay />              **← 文章卡片列表**
        │
        └── information slot → <SideBar />
                                  ├── <UserInfo />
                                  ├── <Announcement />
                                  ├── <ElectronicClocks />
                                  ├── <RandomArticle />      v-if="showRandom"
                                  ├── <TagListCard />
                                  ├── <ChargingList />
                                  ├── <DailySoup />
                                  └── <WebsiteInfo />
```

### Article `/article/:id` (headerType: page)

```
Article.vue (~960 lines, 最复杂页面)
├── <div.progress>                     ← 阅读进度条 (fixed, top:0)
├── <div.article-layout>
│   ├── <div.article-content>
│   │   ├── 封面区域 (head_title) + 分类/标签/标题/统计
│   │   ├── <MdPreview />              ← Markdown 渲染
│   │   ├── 版权声明 + 标签 + 点赞/收藏/分享  (isServiceAvailable门控)
│   │   ├── 支付宝打赏
│   │   ├── 上下篇导航
│   │   └── <Comment />               **← 共享: 也用于留言板**
│   │
│   └── <div.right-side> (目录区域, 桌面端)
│       ├── <AuthorInfo />
│       └── <DirectoryCard />
│
├── <MobileDirectoryCard />            ← 移动端抽屉目录
├── <BottomRightLayout to-top to-comment reading-mode />
│   ⚠ DUPLICATE: Layout也渲染一个 BottomRightLayout(to-top)，见 IMPACT-MATRIX
└── <el-affix> 阅读模式退出按钮
```

### Other pages

| Route | Key components | Special notes |
|-------|---------------|---------------|
| `/message` | `<Comment />` (复用为留言板) + `<SideBar />` | 离线时留言列表和输入框隐藏 |
| `/message/detail/:id?` | 留言详情 | — |
| `/timeline` | 时间轴列表 | 纯 requestOrRead 降级 |
| `/category/:id?` | 分类文章列表 | 纯 requestOrRead 降级 |
| `/tags/:id?` | 标签云 + 文章列表 | 纯 requestOrRead 降级 |
| `/tree-hole` | 匿名树洞, header:none, 无 footer | 离线显示"服务离线，树洞功能不可用" |
| `/music` | `<Music>` 全页音乐播放器 | 与 MusicAi 共享 musicStore |
| `/photo` | `<AlbumBanner>` + `<PhotoGallery>` + `<PhotoPreview>` | 无离线处理 |
| `/link` | 友链卡片列表 | 离线静默不加载 |
| `/about` | 关于页面 | — |
| `/setting` | 用户设置 | — |
| `/welcome/**` | 登录/注册/重置密码 | 独立路由，非 layout 子路由 |

## Shared Components (修改需谨慎)

| 组件 | 被谁使用 | 关键影响 |
|------|---------|---------|
| **Nav** | Header (所有 headerType) | 所有页面都受影响 |
| **NavList** | Nav (desktop), NavForMob (mobile) | 全站导航链接 |
| **SearchByDB** | Nav, NavForMob | 桌面 + 移动端搜索 |
| **UserLogin** | Nav, NavForMob | 桌面 + 移动端登录 |
| **ColorModeToggle** | Nav, NavForMob | 桌面 + 移动端主题切换 |
| **Footer** | Layout/index.vue (v-if) | 所有 showFooter=true 的页面 |
| **BottomRightLayout** | Layout (to-top) + Article (to-top/to-comment/reading-mode) | ⚠ 在 /article 路由重复渲染2次 |
| **Comment** | Article, Message/MessageList | 文章详情 + 留言板 |
| **SideBar** | Layout main-sidebar (v-if="showSidebar") | 首页 + 留言板 |
| **CardEssay** | Home/Main content slot | 首页文章列表 |
| **Loading** | App.vue | 全站加载 |
| **CanvasLayer** | App.vue | 全站背景画布 |
| **Header** | Layout (单一入口，统一 home/page/none) | 所有页面 |
