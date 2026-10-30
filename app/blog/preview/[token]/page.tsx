import { notFound } from "next/navigation"
import { getBlogPostByPreviewToken } from "@/lib/services/blog"
import { resolveImageUrl } from "@/lib/images"

interface Props {
  params: { token: string }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

export default async function BlogPreviewPage({ params }: Props) {
  const data = await getBlogPostByPreviewToken(params.token)
  if (!data || !data.post) notFound()

  const post = data.post

  return (
    <div className="space-y-0">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border border-amber/30 bg-amber/10 text-amber-800 mb-4">
          Preview — not yet published
        </div>
      </div>

      <section className="relative rounded-3xl border border-border bg-card overflow-hidden">
        {post.coverImage ? (
          <div className="relative aspect-video md:aspect-[16/9] overflow-hidden">
            <img
              src={resolveImageUrl(post.coverImage) ?? post.coverImage}
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
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border border-amber/30 bg-amber/10 text-amber-800">
              Draft
            </span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-foreground lg:text-4xl mb-4">{post.title}</h1>
          <p className="text-lg text-muted leading-relaxed mb-6">{post.excerpt || stripHtml(post.content).slice(0, 200)}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted tabular-nums">
            <span>{post.readTime} min read</span>
            <span>·</span>
            <span>{post.authorName}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="prose prose-lg text-muted max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      </section>
    </div>
  )
}
