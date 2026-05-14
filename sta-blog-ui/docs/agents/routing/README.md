# 路由系统

## 方案

使用 **Vue Router 4**，路由配置文件在 `src/router/`。

## 页面路由

| 路径 | 视图 | 说明 |
|:---|:---|:---|
| `/` | `Home/` | 首页 |
| `/article/:id` | `Article/` | 文章详情 |
| `/about` | `About/` | 关于 |
| `/amusement` | `Amusement/` | 娱乐（留言板、树洞） |
| `/link` | `Link/` | 友链 |
| `/music` | `Music/` | 音乐 |
| `/photo` | `Photo/` | 相册 |
| `/pigeonhole` | `Pigeonhole/` | 归档 |
| `/setting` | `Setting/` | 设置 |
| `/welcome` | `Welcome/` | 登录/注册 |

## 路由特性

- 使用按需加载（动态 import）
- 路由守卫处理登录状态和权限
- 布局组件 `Layout/` 包裹页面内容
