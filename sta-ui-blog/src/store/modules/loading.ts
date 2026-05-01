import {defineStore} from 'pinia';

const useLoadingStore = defineStore('loading', () => {
    // 改为 true 可以强制停留在 loading 页面进行调整
    const isLoading = shallowRef<boolean>(false)

    function hide(){
        document.body.style.overflow = '';
        isLoading.value = false
    }
    function show(){
        document.body.style.overflow = 'hidden';
        isLoading.value = true
    }

    return {
        isLoading,
        hide,
        show
    }
})

export default useLoadingStore;
