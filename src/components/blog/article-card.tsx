"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Clock, ArrowRight, Eye } from "lucide-react"
import { useViewCount } from "@/lib/use-view-count"

interface Post {
  slug: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  readTime: string
}

interface ArticleCardProps {
  post: Post
  index?: number
  featured?: boolean
}

export function ArticleCard({ post, index = 0, featured = false }: ArticleCardProps) {
  const views = useViewCount(post.slug)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/blog/${post.slug}`}>
        <Card className={cn(
          "group overflow-hidden cursor-pointer transition-all duration-300",
          "hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10",
          featured && "md:col-span-2"
        )}>
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <CardTitle className={cn(
              "text-xl font-bold text-white group-hover:text-cyan-400 transition-colors",
              featured && "text-2xl md:text-3xl"
            )}>
              {post.title}
            </CardTitle>
            <CardDescription className="text-slate-400 line-clamp-2">
              {post.excerpt}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <div className="flex items-center gap-4">
                <span>{formatDate(post.date)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {views > 0 ? views : "加载中"}
                </span>
              </div>
              
              <span className="flex items-center gap-1 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                阅读更多 <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
