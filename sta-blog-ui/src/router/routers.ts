export const constantRouter = [
    {
        path: '/',
        name: 'layout',
        component: () => import('@/views/Layout/index.vue'),
        children: [
            // 首页
            {
                path: '',
                component: () => import('@/views/Home/index.vue'),
                name: 'home',
                meta: {
                    title: 'marcus-blog | 不断追求完美的开源博客',
                }
            },
            // 时间轴
            {
                path: '/timeline',
                component: () => import('@/views/Pigeonhole/TimeLine.vue'),
                name: 'timeline',
                meta: {
                    title: '时间轴',
                }
            },
            // 分类
            {
                path: '/category/:id?',
                component: () => import('@/views/Pigeonhole/Category.vue'),
                name: 'category',
                meta: {
                    title: '文章分类',
                }
            },
            // 标签
            {
                path: '/tags/:id?',
                component: () => import('@/views/Pigeonhole/Tags.vue'),
                name: 'tags',
                meta: {
                    title: '文章标签',
                }
            },
            // 树洞
            {
                path: '/tree-hole',
                component: () => import('@/views/Amusement/TreeHole.vue'),
                name: 'treeHole',
                meta: {
                    title: '心灵树洞',
                }
            },
            // 留言版
            {
                path: '/message',
                component: () => import('@/views/Amusement/Message/index.vue'),
                name: 'message',
                children: [
                    {
                        path: '',
                        component: () => import('@/views/Amusement/Message/MessageList.vue'),
                        name: 'messageList',
                        meta: {
                            title: '留言板',
                        }
                    },
                    {
                        path: '/message/detail/:id?',
                        component: () => import('@/views/Amusement/Message/MessageDetail.vue'),
                        name: 'messageDetail',
                        meta: {
                            title: '留言详情',
                        }
                    }
                ]
            },
            // 友链
            {
                path: '/link',
                component: () => import('@/views/Link.vue'),
                name: 'link',
                meta: {
                    title: '博客友链',
                }
            },
            // 音乐
            {
                path: '/music',
                component: () => import('@/views/Music/index.vue'),
                name: 'music',
                meta: {
                    title: '音乐',
                }
            },
            // 关于
            {
                path: '/about',
                component: () => import('@/views/About.vue'),
                name: 'about',
                meta: {
                    title: '关于网站',
                }
            },
            // 相册
            {
                path: '/photo',
                component: () => import('@/views/Photo/index.vue'),
                name: 'photo',
                meta: {
                    title: '相册',
                }
            },
        ]
    },
    // 文章
    {
        path: '/article/:id',
        component:
            () => import('@/views/Article/index.vue'),
        name: 'article',
        meta: {
            title: '文章详情',
        }
    },
    // 登录
    {
        path: '/welcome',
        component: () => import('@/views/Welcome/index.vue'),
        name: 'welcome',
        redirect: '/login',
        children: [
            {
                path: '/login',
                component: () => import('@/views/Welcome/Login.vue'),
                name: 'welcome-login',
                meta: {
                    title: '用户登录',
                }
            },
            {
                path: '/register',
                component: () => import('@/views/Welcome/Register.vue'),
                name: 'welcome-register',
                meta: {
                    title: '用户注册',
                }
            },
            {
                path: '/reset',
                component: () => import('@/views/Welcome/Reset.vue'),
                name: 'welcome-reset',
                meta: {
                    title: '重置密码',
                }
            }
        ]
    },
    // 设置
    {
        path: '/setting',
        component: () => import('@/views/Setting.vue'),
        name: 'setting',
        meta: {
            title: '用户设置',
        }
    },
    // 访问其他任何不存在的路由，重定向到首页
    {
        path: '/:pathMatch(.*)*',
        redirect: '/',
        name: 'any',
    }
]