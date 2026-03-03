import { Suspense } from "react"
import { getAllPosts } from "@/lib/posts-server"
import { Navbar } from "@/components/blog/navbar"
import { Footer } from "@/components/blog/footer"
import { BlogPageContent } from "@/components/blog/blog-page-content"

export default async function BlogPage() {
  const allPosts = await getAllPosts()

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <Suspense fallback={<div className="animate-pulse space-y-8">
          <div className="h-32 bg-slate-900/50 rounded-2xl" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-900/50 rounded-2xl" />)}
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-slate-900/50 rounded-xl" />
              <div className="h-48 bg-slate-900/50 rounded-xl" />
            </div>
          </div>
        </div>}>
          <BlogPageContent allPosts={allPosts} />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
