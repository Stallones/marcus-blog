/**
 * Banner 图片静态导入
 * 静态模式下从 src/assets/banners/ 加载，参与 Vite 构建压缩
 */

import banner1 from '@/assets/banners/banner-1.jpg'
import banner2 from '@/assets/banners/banner-2.jpg'
import banner3 from '@/assets/banners/banner-3.jpg'
import banner4 from '@/assets/banners/banner-4.png'
import banner5 from '@/assets/banners/banner-5.png'

export const bannerImages: string[] = [
  banner1,
  banner2,
  banner3,
  banner4,
  banner5,
]
