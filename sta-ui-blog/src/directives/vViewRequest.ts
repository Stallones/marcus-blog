// import {onUnmounted} from 'vue';

const vViewport = {
    mounted(el: HTMLElement, binding: any) {
        const options = {
            root: binding.value?.root || null, // 可选的根元素，默认为视口
            rootMargin: binding.value?.rootMargin || '0px', // 可选的根元素边距
            threshold: binding.value?.threshold || 0, // 可选的相交比例阈值
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // 元素进入视口，执行加载操作
                    binding.value?.callback?.(el);
                    // 停止观察，避免重复触发
                    observer.unobserve(el);
                }
            });
        }, options);

        observer.observe(el);

        // 关键：将观察器存储到元素上，供 unmounted 钩子使用
         el._observer = observer; // 使用元素的自定义属性暂存
    },
        // // 在组件卸载时停止观察
        // onUnmounted(() => {
        //     observer.unobserve(el);
        // });
        // 新增指令的 unmounted 钩子，在元素卸载时清理
    unmounted(el: HTMLElement) {
        // 从元素上获取观察器并停止观察
        if (el._observer) {
        el._observer.unobserve(el);
        delete el._observer; // 清理自定义属性
        }
    },
};

export default vViewport;