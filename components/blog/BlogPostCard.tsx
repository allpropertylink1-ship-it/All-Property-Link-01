import Link from "next/link"
import { resolveImageUrl, toThumbUrl } from "@/lib/images"
import { formatViewsCompact } from "@/lib/utils"
import type { BlogPostCard } from "@/lib/services/blog"

interface BlogPostCardProps {
  post: BlogPostCard
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const coverUrl = post.coverImage ? resolveImageUrl(post.coverImage) ?? post.coverImage : null
  const thumbUrl = coverUrl ? toThumbUrl(coverUrl, 400) : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
    >
      {thumbUrl ? (
        <div className="relative aspect-[4/3] rounded-t-xl overflow-hidden bg-gray-100">
          <img
            src={thumbUrl}
            alt={post.coverImageAlt || post.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        <div className="aspect-[4/3] rounded-t-xl bg-gray-200 flex items-center justify-center">
          <span className="text-xs font-medium text-muted/60">No image</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {post.category && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium border ${
                post.category.color
                  ? `border-${post.category.color}/30 bg-${post.category.color}/10 text-${post.category.color}`
                  : "border-border bg-gray-50 text-muted"
              }`}
            >
              {post.category.name}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-muted line-clamp-2">{post.excerpt}</p>
        )}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {post.authorAvatar ? (
              <img
                src={resolveImageUrl(post.authorAvatar) ?? post.authorAvatar}
                alt=""
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : null}
            <span className="text-xs text-muted">{post.authorName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted tabular-nums">
            <span>{post.readTime} min read</span>
            <span>·</span>
            <span>{formatViewsCompact(post.viewCount)} views</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
