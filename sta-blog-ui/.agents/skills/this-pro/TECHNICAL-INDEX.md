# Technical Pattern Index

> Maps vue-best-practices reference topics to actual project files.
> ✅ = pattern actively used | ⚡ = beneficial but not applied | ❌ = not applicable

## Composition API & `<script setup>` (sfc.md)

| File | Pattern | Notes |
|------|---------|-------|
| **Almost all .vue files** | `<script setup lang="ts">` | Nearly 100% adoption. Project norm. |
| **store/modules/\*.ts** | `defineStore` with setup syntax | `website.ts`, `service.ts`, `loading.ts`, `search.ts`, `user.ts` |
| **music.ts** | `defineStore` with options syntax | Exception: uses `options API` style for persist plugin compatibility |

## Component Data Flow (component-data-flow.md)

| Pattern | Files | Implementation |
|---------|-------|---------------|
| `defineProps` type-based | `Banner.vue`, `Comment/index.vue`, `Card/index.vue`, `Layout/Main/index.vue`, `Layout/PageHeader.vue`, `Article/index.vue` | TypeScript generics or runtime `{ type: ..., default: ... }` |
| `defineEmits` | `EmojiPicker.vue`, `Card/index.vue` | Kebab-case event names |
| `requestOrRead` (双模式) | `store/modules/service.ts`, `store/modules/website.ts` | 自定义策略: 在线调用 API, 离线读取本地 .enc |
| Props drilling (>2 levels) | 不显著 | 项目层级浅 (< 3层), 未使用 provide/inject |

**⛔ Anti-patterns observed:**
- `SearchByDB.vue` uses `useServiceStore()` directly instead of receiving service status as prop → violates props-down principle
- `UserLogin.vue` uses inline `margin-right: 3rem` on `<el-avatar>` and `<style>` tag → old pattern, should use scoped class

## State Management (state-management.md)

| Module | Type | Persistence | Notes |
|--------|------|-------------|-------|
| `loading` | Setup store | None | `shallowRef` for perf |
| `music` | Options store | `pinia-plugin-persist` (localStorage) | 最复杂 ~350 lines |
| `pagination` | Options store | None | Article + Comment pagination |
| `search` | Setup store | None | Search results |
| `service` | Setup store | None | Health check + online/offline mode |
| `user` | Setup store | None | Token from localStorage (auth.ts) |
| `website` | Setup store | None | WebInfo + search titles |

## Slots (component-slots.md)

| Component | Slot Name | Used By |
|-----------|-----------|---------|
| `Layout/Main/index.vue` | `content`, `information` | Home/Main/index.vue |
| `Card/index.vue` | `default` | TagListCard, RandomArticle 等 SCard 组件 |
| `Comment/index.vue` | — | 无 slot, `ReplyBox` 通过条件渲染控制 |

## Async Patterns (component-async.md + component-suspense.md)

| File | Pattern | Notes |
|------|---------|-------|
| `routers.ts` | `() => import(...)` | 所有路由均为 lazy load |
| `store/modules/website.ts` | `await requestOrRead(...)` | Async data fetching |
| `store/modules/music.ts` | `await fetch(...)` | Music API calls |
| `App.vue` | `v-if="useService.afterCheckService"` | 异步检查服务后再渲染 |

**No Suspense used** — project uses `v-if` for loading gates.

## Transitions & Animations (component-transition.md, animation-*.md)

| File | Pattern | Type |
|------|---------|------|
| `App.vue` | `<transition name="slide-down">` | Enter/leave on DevToolsBlocker |
| `Layout/index.vue` | `<transition name="el-fade-in-linear">` | Route transition |
| `Music-ai/index.vue` | `<TransitionGroup>` | Song list entrance animation (stagger) |
| `Nav/NavList.vue` | CSS transition + transform | Dropdown slide + underline animation |
| `Nav/index.vue` | CSS transition on `top` + `background-color` | Nav hide/show on scroll |
| `Card/index.vue` | `v-slide-in` directive | Custom directive for card entrance |
| `Various` | CSS `@keyframes` | Wave, gradient, glow effects |

## Custom Directives (directives.md)

| Directive | File | Type | Notes |
|-----------|------|------|-------|
| `v-slide-in` | `Card/index.vue` | Custom | Used for card/component entrance animation |

## Composables (composables.md)

| Composable | Location | Used By |
|------------|----------|---------|
| `useWebsiteStore()` | `store/modules/website.ts` | `Nav/index.vue`, `Footer`, etc. |
| `useServiceStore()` | `store/modules/service.ts` | `App.vue`, `Article/index.vue`, etc. |
| `useUserStore()` | `store/modules/user.ts` | `UserLogin.vue` |
| `useMusicStore()` | `musicStore.ts` | `Music-ai/index.vue` |
| `useLoadingStore()` | `store/modules/loading.ts` | `http.ts` (自动) |

## Teleport (component-teleport.md)

**Not used in this project.** Modal/drawer controls (e.g., NavForMob drawer, Music-Ai panel) rely on fixed positioning within the component, not `<Teleport>`.

**⚠ Potential issue**: If any parent uses `transform` or creates a stacking context, fixed-position elements inside will break. Currently all parents use `position: static` or `relative` without `transform`, so it works.

## KeepAlive (component-keep-alive.md)

**Not used.** Route components are destroyed on navigation. Each page re-fetches data on mount.

## Perf Optimizations (perf-*.md)

| Pattern | Status | Notes |
|---------|--------|-------|
| Lazy route loading ✅ | `routers.ts` | All routes use `() => import(...)` |
| `v-once` / `v-memo` ❌ | Not used | Potential: static banner content, footer |
| Virtual lists ❌ | Not used | Lists are paginated (10/page) so no issue |
| `shallowRef` ✅ | `website.ts`, `user.ts`, `loading.ts`, `musicStore.ts` | Used where deep reactivity not needed |
| Debounce/throttle ✅ | `Nav/index.vue` (scroll), `Tool.ts` (utility) | Scroll event, search input |
| `Object.freeze` ❌ | Not used | Could be applied to large static datasets |

## CSS & Styling Patterns

| Pattern | Files | Notes |
|---------|-------|-------|
| Scoped SCSS | All `.vue` components | Standard project practice |
| CSS Variables (theme) | `theme.scss` | `:root` + `html.dark` dual theme |
| `::v-deep` / `:deep()` | `Comment/index.vue` | For styling child component internals |
| `@media (max-width: 910px)` | Multiple components | Main responsive breakpoint |
| `@media (max-width: 1200px)` | `Layout/Main/index.vue` | Sidebar collapse breakpoint |
| `backdrop-filter: blur(6px)` | `Nav/index.vue`, `NavForMob.vue` | Glassmorphism effect |

## Store Module API Client Patterns

```
http.ts (Axios wrapper)
├── baseURL: VITE_APP_BASE_API
├── Request interceptor:
│   ├── Auth token injection
│   ├── Loading/NProgress control
│   └── Music API URL override
└── Response interceptor:
    ├── Error toast notifications
    ├── Code 1012 (banned) handling
    └── IGNORE_ERROR_PATH list

file-reader.ts (Offline fallback)
└── localResponse<T>(path)
    ├── isCrypto() ? read .enc → decrypt → parse JSON
    └── !isCrypto() ? fetch .json → parse JSON

generate-static-data.ts (Node.js script)
└── Fetches from backend API → AES encrypt → write to public/
    ├── public/api/*.enc (website, categories, tags, article-list, search-titles)
    └── public/articles/*.enc (article details by ID)
```

## Offline/Online Mode — Per-Page Degradation Strategy

> Project uses `requestOrRead()` in `store/modules/service.ts` to implement dual-mode data fetching.
> **Mode A** = transparent fallback | **Mode B** = mixed (data fallback + UI gating) | **Mode C** = gate-only (offline disabled) | **Mode D** = no awareness

| Route | Page | Mode | Data Fetch | isServiceAvailable Gating | Offline UX |
|-------|------|------|-----------|---------------------------|------------|
| `/` | Home/Main | **C** | — (no direct fetch) | `!isServiceAvailable` → show `<OfflineSearch />` | Replaces online search with offline search |
| `/article/:id` | Article | **B** | `requestOrRead(getArticleDetail, readArticleDetail)` | Comment/Like/Favorite/RandomArticle hidden | Core content works; interactions disabled |
| `/timeline` | TimeLine | **A** | `requestOrRead(getTimeLine, readTimeLine)` | none | Transparent fallback — user sees no difference |
| `/category/:id?` | Category | **A** | `requestOrRead(categoryList, readCategoryList)` + article list | none | Transparent fallback |
| `/tags/:id?` | Tags | **A** | `requestOrRead(tagList, readTagList)` + article list | none | Transparent fallback |
| `/tree-hole` | TreeHole | **C** | `getTreeHoleList()` — direct API, NO fallback | `if(isServiceAvailable)` gate + **explicit offline message** | "服务离线，树洞功能不可用" |
| `/message` | MessageList | **C** | `getLeaveWordList()` — direct API, NO fallback | `v-if="isServiceAvailable"` hides list + form | List and input silently hidden |
| `/link` | Link | **C** | `linkList()` — direct API, NO fallback | `if(isServiceAvailable)` gate, silent | List silently not loaded |
| `/music` | Music | **D** | external iframe | none | No offline handling |
| `/photo` | Photo | **D** | `getPhotoList()` — direct API | none (no useServiceStore import) | No offline handling |
| `/about` | About | — | static page | none | static content |
| `/setting` | Setting | — | user settings page | none | form-based |

### Architecture Implications

```
service.ts (store)
├── isServiceAvailable    ← single boolean flag for online status
├── afterCheckService     ← gate for App.vue router-view rendering
└── requestOrRead(apiFn, readFn, params) ← dual-mode fetch
    ├── Online:  calls apiFn() → standard API request
    └── Offline: calls readFn() → reads local .enc file (AES decrypt)

file-reader.ts
└── localResponse<T>(path) or read*() functions
    ├── .enc files → crypto-js decrypt → JSON.parse
    └── .json files → fetch + JSON.parse

generate-static-data.ts (Node.js build script)
└── API → AES encrypt → public/ directory
    ├── public/api/*.enc        (website, categories, tags, article-list, search-titles)
    └── public/articles/*.enc   (article details)
```

### ⚠ Offline Coverage Gaps

| Gap | Detail |
|-----|--------|
| **TreeHole** cannot work offline | Has `isServiceAvailable` gate but no `requestOrRead` fallback — needs local storage or disable gracefully |
| **Message** cannot work offline | Same issue — no encrypted fallback for leave words |
| **Link** cannot work offline | Same — no fallback data |
| **Photo** ignores offline entirely | No `useServiceStore` import — will show empty gallery |
| **Music** ignores offline entirely | Iframe-based, no local cache |
| **Comment** (in Article) | Server-dependent; `isServiceAvailable` passed as prop `serverOn` |

## Key Dependencies

| Package | Purpose |
|---------|---------|
| Element Plus | UI framework (ElButton, ElAvatar, ElDrawer, ElDropdown, etc.) |
| Pinia | State management |
| vue-router | SPA routing |
| axios | HTTP client |
| md-editor-v3 | Markdown preview/edit |
| crypto-js | AES encryption for offline data |
| pinia-plugin-persist | Music store localStorage persistence |
| nprogress | Top loading bar |
