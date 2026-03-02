import Link from "next/link"
import { siteConfig } from "@/config/site"
import { getAllPosts } from "@/posts/data"
import { Navbar } from "@/components/blog/navbar"
import { Footer } from "@/components/blog/footer"
import { ArticleCard } from "@/components/blog/article-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export default async function Home() {
  const posts = await getAllPosts()
  const featuredPost = posts[0]
  const latestPosts = posts.slice(1, 5) // 只在首页显示前 4 篇

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-transparent" />
          
          <div className="container mx-auto px-4 py-24 relative">
            <div className="max-w-3xl animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm text-cyan-400 mb-6">
                <Sparkles className="h-4 w-4" />
                每日更新 AI 前沿资讯
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {siteConfig.tagline}
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl">
                {siteConfig.description}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/blog">
                  <Button size="lg" className="gap-2">
                    浏览文章 <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg">
                    了解更多
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Article */}
        {featuredPost && (
          <section className="container mx-auto px-4 py-16">
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                <span className="h-8 w-1 bg-cyan-500 rounded-full" />
                精选文章
              </h2>
              
              <ArticleCard post={featuredPost} featured index={0} />
            </div>
          </section>
        )}

        {/* Latest Articles */}
        <section className="container mx-auto px-4 py-16 border-t border-slate-800">
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="h-8 w-1 bg-violet-500 rounded-full" />
                最新文章
              </h2>
              
              <Link href="/blog" className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                查看全部 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {latestPosts.map((post, index) => (
                <ArticleCard key={post.slug} post={post} index={index + 1} />
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="container mx-auto px-4 py-16">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 md:p-12 text-center animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-4">{siteConfig.newsletter.title}</h3>
            <p className="text-slate-400 mb-6">{siteConfig.newsletter.description}</p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="输入邮箱地址"
                className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <Button>订阅</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
