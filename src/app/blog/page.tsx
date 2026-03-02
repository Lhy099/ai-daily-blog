import Link from "next/link"
import { motion } from "framer-motion"
import { siteConfig } from "@/config/site"
import { getAllPosts } from "@/posts/data"
import { Navbar } from "@/components/blog/navbar"
import { Footer } from "@/components/blog/footer"
import { ArticleCard } from "@/components/blog/article-card"

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              所有文章
            </h1>
            <p className="text-lg text-slate-400">
              探索 {posts.length} 篇关于 AI、大模型和深度学习的文章
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <ArticleCard key={post.slug} post={post} index={index} />
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
