export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

export interface Tag {
  id: number | string;
  name: string;
  createTime?: string;
}

export interface Category {
  id: number | string;
  name: string;
  createTime?: string;
}

export interface Article {
  id: number | string;
  title?: string;
  content?: string;
  summary?: string;
  cover?: string;
  createTime?: string;
  updateTime?: string;
  author?: string;
  categoryId?: number | string;
  tags?: Tag[];
  viewCount?: number;
  likeCount?: number;
  favoriteCount?: number;
}

export interface TimeLineItem {
  time: string;
  articles: Article[];
}

export interface TreeHoleItem {
  id: number | string;
  content: string;
  createTime?: string;
}

export interface LeaveWord {
  id: number | string;
  content: string;
  nickname?: string;
  email?: string;
  createTime?: string;
}

export interface Comment {
  id: number | string;
  content?: string;
  userId?: number | string;
  createTime?: string;
}
