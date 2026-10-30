import { cache } from "react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.allpropertylink.co.ke"

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  color: string | null
  _count?: { posts: number }
}

export interface BlogComment {
  id: string
  authorName: string
  authorEmail: string | null
  content: string
  status: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BlogPostCard {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  coverImageAlt: string | null
  authorName: string
  authorAvatar: string | null
  category: { id: string; name: string; slug: string; color: string | null } | null
  readTime: number | null
  viewCount: number
  featured: boolean
  publishedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface BlogPostDetail {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  coverImage: string | null
  coverImageAlt: string | null
  authorName: string
  authorAvatar: string | null
  category: { id: string; name: string; slug: string; color: string | null } | null
  seoTitle: string | null
  seoDescription: string | null
  readTime: number | null
  viewCount: number
  featured: boolean
  publishedAt: Date
  createdAt: Date
  updatedAt: Date
}

const fetchApi = cache(async <T>(path: string): Promise<T | null> => {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    return res.json()
  } catch { return null }
})

export const getBlogPosts = cache(async (filters: {
  category?: string
  search?: string
  featured?: boolean
  page?: number
  pageSize?: number
} = {}): Promise<{
  posts: BlogPostCard[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}> => {
  const params = new URLSearchParams()
  if (filters.category) params.set("category", filters.category)
  if (filters.search) params.set("search", filters.search)
  if (filters.featured === true) params.set("featured", "true")
  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("limit", String(filters.pageSize))

  const data = await fetchApi<{
    posts: BlogPostCard[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }>(`/api/blog/posts?${params}`)
  return data || { posts: [], total: 0, page: 1, pageSize: filters.pageSize || 12, totalPages: 0 }
})

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPostDetail | null> => {
  const data = await fetchApi<{ post: BlogPostDetail | null }>(`/api/blog/posts/${encodeURIComponent(slug)}`)
  return data?.post ?? null
})

export const getBlogPostByPreviewToken = cache(async (token: string): Promise<{
  post: BlogPostDetail | null
  isPreview: boolean
} | null> => {
  const data = await fetchApi<{ post: BlogPostDetail | null; isPreview: boolean } | null>(`/api/blog/preview/${encodeURIComponent(token)}`)
  return data ?? null
})

export const getBlogCategories = cache(async (): Promise<BlogCategory[]> => {
  const data = await fetchApi<{ categories: BlogCategory[] }>("/api/blog/categories")
  return (data?.categories || []).map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    color: c.color ?? null,
    _count: c._count,
  }))
})

export const getBlogPostComments = cache(async (slug: string): Promise<BlogComment[]> => {
  const data = await fetchApi<{ comments: BlogComment[] }>(`/api/blog/posts/${encodeURIComponent(slug)}/comments`)
  return data?.comments || []
})
