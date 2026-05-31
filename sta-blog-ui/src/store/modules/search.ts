import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ArticleVO, Page } from '@/types'

export const useSearchStore = defineStore('search', () => {
  const searchResults = ref<Page<ArticleVO> | null>(null)

  function setSearchResults(results: Page<ArticleVO>) {
    searchResults.value = results
  }

  function clearSearch() {
    searchResults.value = null
  }

  return { searchResults, setSearchResults, clearSearch }
})
