# 样式系统

## 方案

- **Tailwind CSS** — 原子化 CSS，用于快速布局和通用样式
- **SCSS** — 预处理器，用于主题变量、混入和复杂样式
- **Element Plus 主题** — 覆盖 UI 库默认样式

## 样式文件

| 文件 | 用途 |
|:---|:---|
| `index.scss` | 样式入口 |
| `tailwind.css` | Tailwind 指令入口 |
| `variable.scss` | SCSS 变量定义 |
| `theme.scss` | 主题色变量（亮/暗） |
| `mixin.scss` | SCSS 混入 |
| `reset.scss` | 全局样式重置 |
| `element_style.scss` | Element Plus 样式覆盖 |
| `scrollBar.scss` | 滚动条 |
| `cursor.scss` | 自定义光标 |
| `woff.scss` | Web 字体 |

## 主题

- 支持日间/夜间主题切换（`DayNightToggle` 组件）
- 主题变量集中在 `theme.scss` 中管理
- SCSS 变量统一在 `variable.scss` 中定义
