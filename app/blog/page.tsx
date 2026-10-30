import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBlogPosts, getBlogCategories } from "@/lib/services/blog"
import { siteUrl } from "@/lib/seo"
import BlogPostCard from "@/components/blog/BlogPostCard"
import BlogHero from "@/components/blog/BlogHero"
import { NewsletterSignup } from "@/components/blog/NewsletterSignup"

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const category = Array.isArray(searchParams.category) ? searchParams.category[0] : searchParams.category
  const search = Array.isArray(searchParams.search) ? searchParams.search[0] : searchParams.search

  const title = category
    ? `Blog — ${category}`
    : search
      ? `Blog — Search: "${search}"`
      : "Blog — All Property Link"

  const description = category
    ? `Read ${category} stories from All Property Link — market trends, home tips, and community news from Kenya's property marketplace.`
    : search
      ? `Blog search results for "${search}" on All Property Link — market trends, home tips, and community news.`
      : "All Property Link blog — market trends, home buying and selling tips, property news, and community stories from Kenya."

  return {
    title,
    description,
    alternates: { canonical: "/blog" },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl()}/blog`,
    },
  }
}

export default async function BlogPage({ searchParams }: Props) {
  const category = Array.isArray(searchParams.category) ? searchParams.category[0] : searchParams.category
  const search = Array.isArray(searchParams.search) ? searchParams.search[0] : searchParams.search
  const page = Array.isArray(searchParams.page) ? parseInt(searchParams.page[0], 10) || 1 : parseInt(String(searchParams.page), 10) || 1
  const pageSize = Array.isArray(searchParams.pageSize) ? parseInt(searchParams.pageSize[0], 10) || 12 : parseInt(String(searchParams.pageSize), 10) || 12

  const [posts, categories] = await Promise.all([
    getBlogPosts({ category, search, page, pageSize }),
    getBlogCategories(),
  ])

  if (posts.total === 0 && page > 1) notFound()

  return (
    <>
      <link rel="alternate" type="application/rss+xml" href={`${siteUrl()}/api/blog/feed`} />
      <div className="space-y-10">
      <BlogHero
        title="Blog"
        description="Market trends, home buying and selling tips, property news, and community stories from Kenya."
        categories={categories}
        selectedCategory={category ?? undefined}
        searchQuery={search ?? undefined}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {posts.posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted">{search ? `No posts found for "${search}".` : "No blog posts yet."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {posts.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-muted">
              Showing {((page - 1) * posts.pageSize + 1)} to {Math.min(page * posts.pageSize, posts.total)} of {posts.total} posts
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <a
                  href={`/blog?${new URLSearchParams({ ...Object.fromEntries(Object.entries(searchParams) as [string, string][]), page: String(page - 1) }).toString()}`}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
                >
                  Previous
                </a>
              )}
              <span className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground">{page} / {posts.totalPages}</span>
              {page < posts.totalPages && (
                <a
                  href={`/blog?${new URLSearchParams({ ...Object.fromEntries(Object.entries(searchParams) as [string, string][]), page: String(page + 1) }).toString()}`}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <NewsletterSignup />
    </div>
    </>
  )
}
