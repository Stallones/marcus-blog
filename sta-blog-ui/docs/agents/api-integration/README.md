# API 集成层

## 方案

使用 **Axios** 封装 HTTP 请求，位于 `src/utils/http.ts`。

## API 模块划分

API 按业务领域垂直切分，每个模块独立文件：

| 模块 | 路径 | 接口范围 |
|:---|:---|:---|
| article | `src/apis/article/index.ts` | 文章 CRUD、搜索 |
| category | `src/apis/category/index.ts` | 分类管理 |
| tag | `src/apis/tag/index.ts` | 标签管理 |
| home | `src/apis/home/index.ts` | 首页数据 |
| user | `src/apis/user/index.ts` | 用户认证 |
| comment | `src/apis/leaveWord/index.ts` | 留言/评论 |
| music | `src/apis/music/index.ts` | 音乐列表 |
| photo | `src/apis/photo/index.ts` | 相册 |
| link | `src/apis/link/index.ts` | 友链 |
| favorite | `src/apis/favorite/index.ts` | 收藏/点赞 |
| email | `src/apis/email/index.ts` | 邮件发送 |
| thirdParty | `src/apis/thirdParty/index.ts` | 第三方服务 |
| treeHole | `src/apis/treeHole/index.ts` | 树洞 |
| website | `src/apis/website/index.ts` | 网站配置 |

## 请求封装

- 基础 URL 和拦截器在 `http.ts` 中统一配置
- 每个 API 模块返回 Promise，封装统一的错误处理
- 使用 TypeScript 类型标注请求和响应
