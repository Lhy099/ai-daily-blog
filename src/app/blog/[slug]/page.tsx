import Link from "next/link"
import { notFound } from "next/navigation"
import { motion } from "framer-motion"
import { getPostBySlug, getAllPosts } from "@/posts/data"
import { siteConfig } from "@/config/site"
import { Navbar } from "@/components/blog/navbar"
import { Footer } from "@/components/blog/footer"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Clock, ArrowLeft } from "lucide-react"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /
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
                <Clock className="h-4 w-4" /
                {post.readTime}
              </span>
              <span>作者: {siteConfig.author}</span>
            </div>
          </header>

          <div 
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
          />
        </motion.article>
      </main>

      <Footer />
    </div>
  )
}

export function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export function generateMetadata({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug)
  
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
