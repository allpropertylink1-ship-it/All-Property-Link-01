import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBlogPostBySlug, getBlogPosts } from "@/lib/services/blog"
import { siteUrl } from "@/lib/seo"
import { resolveImageUrl } from "@/lib/images"
import BlogPostCard from "@/components/blog/BlogPostCard"

interface Props {
  params: { slug: string }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)
  if (!post) return {}

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt || stripHtml(post.content).slice(0, 160)
  const coverUrl = post.coverImage ? resolveImageUrl(post.coverImage) ?? post.coverImage : null

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl()}/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteUrl()}/blog/${post.slug}`,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.authorName],
      images: coverUrl ? [{ url: coverUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: coverUrl ? [coverUrl] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug)
  if (!post) notFound()

  const related = await getBlogPosts({ pageSize: 3 })

  return (
    <div className="space-y-0">
      <BlogPostHero post={post} />
      <BlogPostContent post={post} />
      <BlogRelatedPosts
        currentSlug={post.slug}
        categoryId={post.category?.id}
        allPosts={related.posts}
      />
    </div>
  )
}

function BlogPostHero({ post }: { post: NonNullable<Awaited<ReturnType<typeof getBlogPostBySlug>>> }) {
  const coverUrl = post.coverImage ? resolveImageUrl(post.coverImage) ?? post.coverImage : null

  return (
    <section className="relative rounded-3xl border border-border bg-card overflow-hidden">
      {coverUrl ? (
        <div className="relative aspect-video md:aspect-[16/9] overflow-hidden">
          <img
            src={coverUrl}
            alt={post.coverImageAlt || post.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="aspect-video md:aspect-[16/9] bg-primary flex items-center justify-center">
          <span className="text-xl font-medium text-white/90">{post.title}</span>
        </div>
      )}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="flex items-center gap-2 mb-3">
          {post.category && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border ${
                post.category.color
                  ? `border-${post.category.color}/30 bg-${post.category.color}/10 text-${post.category.color}`
                  : "border-border bg-gray-50 text-muted"
              }`}
            >
              {post.category.name}
            </span>
          )}
          {post.featured && (
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border border-gold/30 bg-gold/10 text-gold">
              Featured
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold font-heading text-foreground lg:text-4xl mb-4">{post.title}</h1>
        <p className="text-lg text-muted leading-relaxed mb-6">{post.excerpt || stripHtml(post.content).slice(0, 200)}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted tabular-nums">
          <span>{post.readTime} min read</span>
          <span>·</span>
          <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</span>
          <span>·</span>
          <span>{post.authorName}</span>
          <span>·</span>
          <span>{post.viewCount} views</span>
        </div>
      </div>
    </section>
  )
}

function BlogPostContent({ post }: { post: NonNullable<Awaited<ReturnType<typeof getBlogPostBySlug>>> }) {
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-24">
      <div className="prose prose-lg text-muted max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
    </section>
  )
}

function BlogRelatedPosts({
  currentSlug,
  categoryId,
  allPosts,
}: {
  currentSlug: string
  categoryId?: string
  allPosts: { id: string; slug: string; title: string; excerpt: string | null; coverImage: string | null; coverImageAlt: string | null; authorName: string; authorAvatar: string | null; category: { id: string; name: string; slug: string; color: string | null } | null; readTime: number | null; viewCount: number; featured: boolean; publishedAt: Date; createdAt: Date; updatedAt: Date }[]
}) {
  const related = allPosts
    .filter((p) => p.slug !== currentSlug && (!categoryId || p.category?.id === categoryId))
    .slice(0, 3)

  if (related.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
      <h2 className="text-2xl font-bold font-heading text-foreground mb-6">Related stories</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}
