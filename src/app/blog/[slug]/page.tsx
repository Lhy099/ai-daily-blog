import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { getPostBySlug, getAllPosts, getRelatedPosts } from "@/posts/data"
import { siteConfig } from "@/config/site"
import { Navbar } from "@/components/blog/navbar"
import { Footer } from "@/components/blog/footer"
import { ArticleCard } from "@/components/blog/article-card"
import { PostViews } from "@/components/blog/post-views"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Clock, ArrowLeft } from "lucide-react"

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const allPosts = await getAllPosts()
  const relatedPosts = getRelatedPosts(slug, allPosts, 3)

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <article className="max-w-4xl mx-auto animate-fade-in">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回文章列表
          </Link>

          <header className="mb-12">
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-slate-400">
              <span>{formatDate(post.date)}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
              <PostViews slug={slug} />
              <span>作者: {siteConfig.author}</span>
            </div>
          </header>

          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {relatedPosts.length > 0 && (
            <section className="mt-16 border-t border-slate-800 pt-12">
              <h2 className="mb-6 text-2xl font-bold text-white">相关文章</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {relatedPosts.map((relatedPost, index) => (
                  <ArticleCard key={relatedPost.slug} post={relatedPost} index={index} />
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </div>
  )
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return {
      title: "文章未找到",
    }
  }

  return {
    title: `${post.title} | ${siteConfig.name}`,
    description: post.excerpt,
  }
}
