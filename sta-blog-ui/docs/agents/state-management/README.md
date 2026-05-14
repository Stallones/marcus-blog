# 状态管理

## 方案

使用 **Pinia** 进行全局状态管理，模块文件位于 `src/store/modules/`。

## 状态模块

| 模块 | 文件 | 职责 |
|:---|:---|:---|
| Loading | `loading.ts` | 全局加载状态 |
| Music | `music.ts` | 音乐播放控制 |
| Pagination | `pagination.ts` | 分页状态 |
| Service | `service.ts` | 服务状态 |
| User | `user.ts` | 用户登录/信息 |
| Website | `website.ts` | 网站配置 |

## 使用模式

- 使用 `defineStore` 定义 store
- 使用 Composition API 风格（setup store）
- 页面级状态保持在组件内，全局共享状态才放入 Pinia
