# 前端架构

## 技术栈

- Vue 3（Composition API + `<script setup>`）
- TypeScript
- Vite 5
- Element Plus（UI 库）
- Pinia（状态管理）
- Vue Router
- Tailwind CSS + SCSS

## 目录结构

```
src/
├── apis/          # API 接口层
├── assets/        # 静态资源
├── components/    # 公共组件
├── config/        # 配置
├── const/         # 常量
├── directives/    # 自定义指令
├── router/        # 路由
├── store/         # 状态管理
├── styles/        # 样式
├── types/         # 类型
├── utils/         # 工具函数
└── views/         # 页面视图
```

## 编码规范

- 使用 Composition API + `<script setup>`
- 组件名使用 PascalCase
- 文件名使用 kebab-case（.vue 文件）或 camelCase（.ts 文件）
- API 层按业务领域模块划分
