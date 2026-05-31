# Cross-Component Impact Matrix

> When modifying component X, check which other components/pages are affected.
> Read **ROUTE-HIERARCHY.md** first to understand the full ancestry chain.
> **Last updated: 2026-05-27 — unified Header architecture**

## Style Modification Workflow

```
1. IDENTIFY: Find target component in this matrix
2. GO UP:    Check all parents that render it
3. GO SIDEWAYS: Check siblings that share the same parent's CSS context
4. GO DOWN:  Check children the component renders
5. VERIFY:   Check ALL routes that mount any of these components
```

## Component Dependency Map

### Header System (unified — single `<Header>` component)

```
Header/index.vue
├── Parents:   Layout/index.vue (ALL routes' layout)
├── Children:  Nav, Images, Brand, MouseTrail, Particles (home), hh-banner inline (page)
├── Props:     headerType ('home'|'page'|'none'), title, subtitle
├── CSS:       .home-header  ← brand-container 100vh → header 100vh → main pushed down
│              .page-header  ← hh-banner 50vh relative → header 50vh → main pushed down
│              hh-banner is position:relative (NOT fixed) — occupies flow space
├── Home siblings: Images(z:-2), Brand(z:-1), MouseTrail, Particles (all fixed → root stacking)
├── Page siblings: (none — hh-banner is the only non-Nav child)
└── Routes affected: ALL
```

### Nav System

```
Nav/index.vue
├── Parents:   Header/index.vue → ALL routes
├── Children:  NavList, ColorModeToggle, SearchByDB, UserLogin, NavForMob (media query)
├── CSS:       position:fixed; z:10; height:50px; .hidden(top:-50px); .transparent(bg:transparent)
└── Routes: ALL

NavForMob.vue
├── Parents:   Nav/index.vue (shown only ≤910px)
├── Children:  NavList (drawer), SearchByDB, UserLogin, ColorModeToggle
└── Routes: ALL (mobile)

NavList.vue
├── Parents:   Nav (desktop menu), NavForMob drawer (mobile menu)
└── Routes: ALL

SearchByDB.vue
├── Parents:   Nav, NavForMob
├── ⚠ Anti-pattern: imports useServiceStore() directly instead of props
└── Routes: ALL

UserLogin.vue
├── Parents:   Nav, NavForMob
└── Routes: ALL

ColorModeToggle.vue
├── Parents:   Nav, NavForMob
└── Routes: ALL
```

### Layout System

```
Layout/index.vue (root layout)
├── Parents:        App.vue <router-view>
├── Children:       Header, main.layout-main, Footer, BottomRightLayout
├── Key computed:   meta.headerType (from route.meta), showSidebar (route.matched)
└── Routes: ALL (as layout parent)

main.layout-main
├── Children:       .main-wrapper > .main-content (router-view) + .main-sidebar (conditionally)
├── CSS:            margin:3rem; display:flex; justify-content:center
│                   @media<1200px → margin:0
└── Displacement:   pushed down by Header height (100vh home, 50vh page, 0 none)
```

### SideBar System

```
SideBar/index.vue
├── Parents:        Layout/main-sidebar (v-if="showSidebar")
├── Children:       UserInfo, Announcement, ElectronicClocks, RandomArticle,
│                   TagListCard, ChargingList, DailySoup, WebsiteInfo
├── Routes:         Home ('/'), Message ('/message') (meta.sidebar === true)
└── CSS:            padding-top:50px; @media<910px → display:none

Layout/Main/index.vue (used by Home/Main/index.vue)
├── Parents:        Home/Main/index.vue (and any other page using it)
├── Children:       content slot, information slot
└── Routes:         Home '/' (currently only consumer)
```

### ⚠  BottomRightLayout — DUPLICATE MOUNT

```
BottomRightLayout
├── Mount 1:  Layout/index.vue → <BottomRightLayout to-top />
├── Mount 2:  Article.vue → <BottomRightLayout to-top to-comment reading-mode />
└── Result:   On /article/:id route, TWO instances render simultaneously.
              Both are position:fixed; z:9999 — they visually overlap.
              Fix: Layout should conditionally skip or Article should remove its own.
```

### Comment System

```
Comment/index.vue
├── Parents:   Article.vue (article detail), Message/MessageList.vue (message board)
├── Children:  EmojiPicker, ReplyBox, ChildComment (recursive)
└── Routes:    `/article/:id`, `/message/`

ChildComment.vue
├── Parents:   Comment/index.vue (recursive)
├── Children:  (self: recursive nested replies)
└── Routes:    `/article/:id`, `/message/`

EmojiPicker.vue
├── Parents:   Comment/index.vue
├── Children:  (inline emoji grid)
└── Routes:    `/article/:id`, `/message/`
```

### Article Page

```
Article.vue
├── Parents:     Layout <router-view>
├── Children:    MdPreview, Comment, DirectoryCard, MobileDirectoryCard, BottomRightLayout ⚠
├── Siblings:    (in main-content only; in App template: Loading, MusicAi, etc.)
├── Data flow:   requestOrRead(getArticleDetail, readArticleDetail, {id})
└── Routes:      `/article/:id`
```

### Music System

```
Music-ai/index.vue (floating player, App.vue level)
├── Parents:     App.vue
├── State:       musicStore (pinia-plugin-persist → localStorage)
├── Children:    (inline template)
└── Routes:      ALL (global)

Music/index.vue (full page player)
├── Parents:     Layout <router-view> (route: /music)
├── State:       musicStore (shared with Music-ai)
└── Routes:      `/music`
```

### Card System

```
Card/index.vue (wrapper)
├── Usage:       imported by SCard/* components as wrapper (not directly in templates)
├── Children:    slot, icon animations
└── Style:       v-slide-in directive for entrance animation

CardEssay.vue
├── Parents:     Home/Main content slot
└── Routes:      `/`
```

## Shared Sub-Components — Full Impact List

| 组件 | 使用方 | 影响范围 | 修改风险 |
|------|--------|---------|---------|
| **Nav** | Header → ALL pages | 全站导航 | 🔴 最高 |
| **NavList** | Nav + NavForMob | 全站导航链接 | 🔴 最高 |
| **SearchByDB** | Nav + NavForMob | 全站搜索入口 | 🔴 最高 |
| **UserLogin** | Nav + NavForMob | 全站登录 | 🔴 最高 |
| **ColorModeToggle** | Nav + NavForMob | 全站主题切换 | 🔴 最高 |
| **Header** | Layout → ALL pages | 全站 header 结构 | 🔴 最高 |
| **Footer** | Layout v-if → ~12 pages | 页面底部 | 🟡 中 |
| **BottomRightLayout** | Layout + Article ⚠ | 全局浮动+文章页(重复!) | 🟡 中 |
| **Comment** | Article + Message | 文章详情 + 留言板 | 🟡 中 |
| **SideBar** | Layout → Home + Message | 首页 + 留言板 | 🟢 低 |
| **Card** | SCard/* → SideBar | 侧边栏所有卡片 | 🟢 低 |
| **CanvasLayer** | App.vue | 全站背景画布 | 🟡 中 |
| **Banner.vue** | 当前未使用 (死代码) | — | — |
| **PageHeader.vue** | 当前未使用 (死代码) | — | — |

## Header Displacement Analysis (critical for layout bugs)

```
headerType "home" ( '/' ):
  Header.home-header (position:relative, no explicit height)
    └── .hh-hero 
          └── .brand-container (position:relative, height:100vh) ← HEADER GETS 100vh FROM FLOW
  → layout-main starts at Y = 100vh + 3rem margin

headerType "page" ('/article/:id', '/timeline', etc.):
  Header.page-header (position:relative, no explicit height)
    └── .hh-banner (position:relative, height:50vh) ← HEADER GETS 50vh FROM FLOW
  → layout-main starts at Y = 50vh + 3rem margin

headerType "none" ('/tree-hole', '/welcome/*'):
  Header renders only <Nav /> (position:fixed — 0 flow height)
  → layout-main starts at Y = 3rem margin

CanvasLayer (App root, position:fixed, z:-1):
  Uses window.scrollY for progressive image reveal
  Home: 100vh header → content starts later → more scrollY → more image shown
  Page: 50vh header → content starts earlier → less scrollY → less image shown
  None: 0 header → content starts immediately → minimal image
  This creates VISUAL CONSISTENCY across page types.
```
