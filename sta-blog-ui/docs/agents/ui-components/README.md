# UI 组件体系

## 组件库

- **Element Plus** — 基础 UI 组件库（按钮、表单、弹窗等）
- **自定义组件** — 项目特有组件，位于 `src/components/`

## 自定义组件分类

| 类别 | 目录 | 说明 |
|:---|:---|:---|
| 布局 | `Layout/` | Header、SideBar、Footer 等 |
| 卡片 | `Card/`, `CardEssay/`, `CardInfo/` | 通用信息卡片 |
| 交互 | `Search/`, `Comment/`, `Pagination/` | 搜索、评论、分页 |
| 特效 | `Particles/`, `Wave/`, `TextGlitch/`, `MouseTrail/` | 动画特效 |
| 工具 | `ToTop/`, `GoBottom/`, `Fullscreen/`, `Loading/` | 辅助功能 |
| 播放器 | `Music/` | 音乐播放器 |
| 主题 | `DayNightToggle/` | 日/夜间切换 |
| 阅读 | `ReadingMode/` | 阅读模式 |

## 组件规范

- 公共组件统一在 `src/components/index.ts` 导出
- 每个组件独立目录，包含 `.vue` 文件和配套资源
- 视图专属组件放在对应 `views/` 模块下
