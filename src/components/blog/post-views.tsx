"use client"

import { Eye } from "lucide-react"
import { useViewCount } from "@/lib/use-view-count"

export function PostViews({ slug }: { slug: string }) {
  const views = useViewCount(slug, true)

  return (
    <span className="flex items-center gap-1">
      <Eye className="h-4 w-4" />
      {views > 0 ? `${views} 次阅读` : "加载中"}
    </span>
  )
}
