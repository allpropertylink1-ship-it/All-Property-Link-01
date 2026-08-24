import { cache } from "react"

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.allpropertylink.co.ke"

export interface ReviewAuthor {
  firstName: string
  lastName: string
}

export interface ReviewItem {
  id: string
  userId: string
  rating: number
  comment: string | null
  createdAt: string | Date
  updatedAt?: string | Date | null
  user: ReviewAuthor
}

export interface ReviewSummary {
  reviews: ReviewItem[]
  total: number
  page: number
  totalPages: number
  avgRating: number | null
  distribution: [number, number, number, number, number]
}

export interface PublicProfile {
  id: string
  firstName: string
  lastName: string
  avatar: string | null
  businessLogo: string | null
  companyName: string | null
  category: string | null
  specialties: string[]
  city: string | null
  region: string | null
  primaryUserType: string | null
  createdAt: string
  listingCount: number
  serviceCount: number
}

const fetchApi = cache(async <T>(path: string): Promise<T | null> => {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
})

/** Reviews ABOUT a seller (targetType USER), paginated newest-first. */
export const getUserReviews = cache(async (userId: string, page = 1): Promise<ReviewSummary> => {
  const data = await fetchApi<ReviewSummary>(
    `/api/reviews/user/${encodeURIComponent(userId)}?page=${page}&limit=10`
  )
  return data || { reviews: [], total: 0, page: 1, totalPages: 0, avgRating: null, distribution: [0, 0, 0, 0, 0] }
})

/** First page + aggregate only — for compact sidebar / top-3 embeds. */
export const getUserReviewSummary = cache(async (userId: string): Promise<{ avgRating: number | null; total: number; topReviews: ReviewItem[] }> => {
  const data = await getUserReviews(userId)
  return { avgRating: data.avgRating, total: data.total, topReviews: data.reviews.slice(0, 3) }
})

export const getProfile = cache(async (userId: string): Promise<PublicProfile | null> => {
  const data = await fetchApi<{ profile: PublicProfile }>(`/api/profiles/${encodeURIComponent(userId)}`)
  return data?.profile ?? null
})
