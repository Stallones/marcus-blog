export const constantRouter = [
    {
        path: '/',
        name: 'layout',
        component: () => import('@/views/Layout/index.vue'),
        children: [
            // ── 首页：全屏 Hero
            {
                path: '',
                component: () => import('@/views/Home.vue'),
                name: 'home',
                meta: {
                    headerType: 'home',
                    showFooter: true,
                    sidebarType: 'default',
                    title: 'marcus-blog | 不断追求完美的开源博客',
                }
            },
            // ── 文章详情 ──
            {
                path: '/article/:id',
                component: () => import('@/views/Article.vue'),
                name: 'article',
                meta: {
                    headerType: 'article',
                    showFooter: true,
                    sidebarType: 'article',
                    title: '文章详情',
                }
            },
            // ── 分类 ──
            {
                path: '/category/:id?',
                component: () => import('@/views/Archive/Category.vue'),
                name: 'category',
                meta: {
                    title: '文章分类',
                    headerType: 'page',
                    sidebarType: 'default',
                    showFooter: true,
                }
            },
            // ── 标签 ──
            {
                path: '/tags/:id?',
                component: () => import('@/views/Archive/Tags.vue'),
                name: 'tags',
                meta: {
                    title: '文章标签',
                    headerType: 'page',
                    showFooter: true,
                }
            },
            // ── 时间轴：横幅模式 ──
            {
                path: '/timeline',
                component: () => import('@/views/Archive/TimeLine.vue'),
                name: 'timeline',
                meta: {
                    headerType: 'page',
                    showFooter: true,
                    title: '时间轴',
                    subtitle: 'TimeLine',
                }
            },
            // ── 树洞 ──
            {
                path: '/tree-hole',
                component: () => import('@/views/Amusement/TreeHole.vue'),
                name: 'treeHole',
                meta: {
                    title: '心灵树洞',
                    headerType: 'none',
                    showFooter: false,
                }
            },
            // ── 留言版 ──
            {
                path: '/message',
                component: () => import('@/views/Amusement/Message/index.vue'),
                name: 'message',
                meta: {
                    title: '留言板',
                    headerType: 'page',
                    showFooter: true,
                    sidebarType: 'default',
                },
                children: [
                    {
                        path: '',
                        component: () => import('@/views/Amusement/Message/MessageList.vue'),
                        name: 'messageList',
                        meta: { title: '留言板', headerType: 'page', showFooter: true },
                    },
                    {
                        path: '/message/detail/:id?',
                        component: () => import('@/views/Amusement/Message/MessageDetail.vue'),
                        name: 'messageDetail',
                        meta: { title: '留言详情', headerType: 'page', showFooter: true },
                    }
                ]
            },
            // ── 友链 ──
            {
                path: '/link',
                component: () => import('@/views/Link.vue'),
                name: 'link',
                meta: {
                    title: '博客友链',
                    headerType: 'page',
                    showFooter: true,
                }
            },
            // ── 音乐 ──
            {
                path: '/music',
                component: () => import('@/views/Music/index.vue'),
                name: 'music',
                meta: {
                    title: '音乐',
                    headerType: 'page',
                    showFooter: true,
                }
            },
            // ── 关于 ──
            {
                path: '/about',
                component: () => import('@/views/About.vue'),
                name: 'about',
                meta: {
                    title: '关于网站',
                    headerType: 'page',
                    showFooter: true,
                }
            },
            // ── 相册 ──
            {
                path: '/photo',
                component: () => import('@/views/Photo/index.vue'),
                name: 'photo',
                meta: {
                    title: '相册',
                    headerType: 'page',
                    showFooter: true,
                }
            },            
        ]
    },
    // ── 登录/注册/重置 ──
    {
        path: '/welcome',
        component: () => import('@/views/Welcome/index.vue'),
        name: 'welcome',
        redirect: '/login',
        meta: {
            headerType: 'none',
            showFooter: false,
        },
        children: [
            {
                path: '/login',
                component: () => import('@/views/Welcome/Login.vue'),
                name: 'welcome-login',
                meta: { title: '用户登录', headerType: 'none', showFooter: false },
            },
            {
                path: '/register',
                component: () => import('@/views/Welcome/Register.vue'),
                name: 'welcome-register',
                meta: { title: '用户注册', headerType: 'none', showFooter: false },
            },
            {
                path: '/reset',
                component: () => import('@/views/Welcome/Reset.vue'),
                name: 'welcome-reset',
                meta: { title: '重置密码', headerType: 'none', showFooter: false },
            }
        ]
    },
    // ── 设置 ──
    {
        path: '/setting',
        component: () => import('@/views/Setting.vue'),
        name: 'setting',
        meta: { title: '用户设置', headerType: 'page', showFooter: true }
    },
    // ── 通配符重定向 ──
    {
        path: '/:pathMatch(.*)*',
        redirect: '/',
        name: 'any',
    }
]
