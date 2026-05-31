# Style Cascade & Theme System

> CSS variable system, scoped style patterns, z-index layer map, responsive breakpoints.
> Critical context for any style modification.

## 1. CSS Variable System (`src/styles/theme.scss`)

### Light Mode (`:root`)
```
--mao-background:       #f8f9fa      (极浅灰, 主背景)
--mao-card-background:  #ffffff      (纯白, 卡片背景)
--mao-accent-color:     #3b82f6      (蓝色, 强调色)
--mao-text-secondary:   #6c757d      (灰色, 次要文本)
--mao-nav-bg:           rgba(248,249,250,0.8)  (毛玻璃导航)
--mao-nav-border:       rgba(0,0,0,0.1)
```

### Dark Mode (`html.dark`)
```
--mao-background:       #0d1117      (深黑, 主背景)
--mao-card-background:  #161b22      (暗灰, 卡片背景)
--mao-accent-color:     #58a6ff      (亮蓝, 强调色)
--mao-text-secondary:   #8b949e      (暗灰, 次要文本)
--mao-nav-bg:           rgba(22,27,34,0.8)   (毛玻璃导航)
--mao-nav-border:       rgba(255,255,255,0.1)
```

### Also overrides Element Plus dark:
`--el-border-color`, `--el-text-color-primary`, `--el-fill-color-*`, `--el-bg-color`, `--el-color-primary`, etc.

## 2. Global Body Style

```scss
body {
  font-family: "阿里妈妈方圆体 VF Regular", sans-serif;
  background-color: var(--mao-background-color);  /* variable: --mao-background */
  color: var(--text-primary, #212529);
  transition: background-color 0.3s ease, color 0.3s ease;  /* 主题切换动画 */
}
```

## 3. Scoped Style Rules

**Standard pattern:** All components use `<style scoped lang="scss">`.

**⚠ Critical rules for scoped styles:**

| Rule | Detail |
|------|--------|
| Parent scoped styles cannot reach child component root | By design. Only `inherit` CSS props pass through |
| `:deep()` needed to penetrate child | Used in `Comment/index.vue` to style Element Plus + Markdown preview |
| Component has `scoped` + root element with class = parent can style via that class | ⚠ Nav's `<nav>` root: PageHeader cannot style it from scoped SCSS |
| If parent needs to style child's internals → use `:deep()` or global class | Currently: Nav is position:fixed and independent |

**Impact on Nav modifications:**
- Nav's `<nav>` has `position: fixed; z-index: 10` — it's positioned relative to viewport, not parent
- HomeHeader's `.full-header` has `position: relative` → creates stacking context
- But Nav is `position: fixed` → it escapes that stacking context
- ⚠ This means modifying Nav's `z-index` or `position` affects the global z-index stack

## 4. Z-Index Layer Map

```
-2:           Images (HomeHeader background carousel, inside .full-header context)
-1:           CanvasLayer (App.vue level, fixed background canvas)
-1:           Brand.brand (HomeHeader title, inside .full-header context)
 0 (auto):    layout-shell, layout-main, banner, brand-container, footer...
 2:           .layout-main (home page parallax-full mode)
 10:          Nav (fixed navigation bar, GLOBAL — escapes .full-header)
 100:         Loading (full-screen loading overlay)
 ~999:        MusicAi (floating music player)
 9999:        BottomRightLayout (back-to-top button)
 10000:       DevToolsBlocker, ContextMenu (highest system layers)
```

## 5. Responsive Breakpoints

| Breakpoint | Effect |
|------------|--------|
| **910px** | Main responsive switch: Nav displayed as `block` → `none`, NavForMob shown. Sidebar hidden. Content padding reduced. |
| **1200px** | Layout/Main margin reduces. Sidebar width changes. |
| **768px / 540px / 450px** | Article page further adjustments. |

### Nav visibility logic:
```scss
// Nav/index.vue
@media screen and (max-width: 910px) {
  display: none;           // 桌面导航隐藏
}

// NavForMob.vue (no display:none by default, shown ≤910px)
```

### Nav header behavior:
```
scrollTop === 0  && isHomePage → transparent (bg: transparent)
scrollDown                      → hidden (top: -50px)
scrollUp                        → visible (top: 0)
```

## 6. CSS Class-Based Animation Patterns

| Animation | Component | Mechanism |
|-----------|-----------|-----------|
| Nav slide hide | `Nav/index.vue` | `.hidden { top: -50px; }` via class toggle on scroll |
| Nav transparent | `Nav/index.vue` | `.transparent { background: transparent; }` |
| Underline slide | `NavList.vue` | `::after` pseudo-element, `left` transition |
| Dropdown expand | `NavList.vue` | `.menus_item_child { transform: scaleY(0/1) }` |
| Card entrance | `Card/index.vue` | Custom `v-slide-in` directive |
| Route transition | `Layout/index.vue` | `<transition name="el-fade-in-linear">` |
| DevToolsBlocker | `App.vue` | `<transition name="slide-down">` |

## 7. Flex Layout Patterns (Nav specific)

```
Nav (nav)
├── #menu-left     flex: 1, align-items: center, font-weight: bold
│   ├── #blog-info  flex: 1, text-align: center
│   └── <NavList /> inline-flex
└── #menu-right    flex: 1, justify-content: flex-end, align-items: center
    ├── ColorModeToggle
    ├── SearchByDB
    └── UserLogin

Layout/Main
├── .content_container        flex: 3, max-width: 75rem
└── .information_container    flex: 1, max-width: 25rem (hidden ≤910px)
```

## 8. Glassmorphism (backdrop-filter)

Applied on Nav backgrounds for frosted glass effect:
```scss
backdrop-filter: blur(6px);
```

⚠ **Performance note**: `backdrop-filter` is GPU-accelerated but can cause flickering on some browsers during scroll. Nav uses `transition: top 0.3s, background-color 0.3s` to coordinate with scroll events.
