"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CalendarDays, FolderOpen, SearchX } from "lucide-react"
import { siteConfig } from "@/config/site"
import { BlogPost, getArchiveStats, getTagStats, filterPostsBy, getDayStats } from "@/posts/data"
import { ArticleCard } from "@/components/blog/article-card"
import { BlogFilters } from "@/components/blog/blog-filters"
import { BlogPagination } from "@/components/blog/blog-pagination"
import { Badge } from "@/components/ui/badge"

const POSTS_PER_PAGE = 6

function readSearchParam(value: string | null): string {
  return value ?? ""
}

export function BlogPageContent({ allPosts }: { allPosts: BlogPost[] }) {
  const searchParams = useSearchParams()
  const tagStats = getTagStats(allPosts)
  const archiveStats = getArchiveStats(allPosts)
  const dayStats = getDayStats(allPosts)

  const query = readSearchParam(searchParams.get("q")).trim()
  const tag = readSearchParam(searchParams.get("tag")).trim()
  const month = readSearchParam(searchParams.get("month")).trim()
  const day = readSearchParam(searchParams.get("day")).trim()
  const pageParam = readSearchParam(searchParams.get("page")).trim()

  const filteredPosts = filterPostsBy(allPosts, { query, tag, month, day })
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const parsedPage = Number.parseInt(pageParam || "1", 10)
  const currentPage =
    Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : Math.min(parsedPage, totalPages)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const pagePosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE)
  const hasFilters = Boolean(query || tag || month || day)

  const createFilterHref = (updates: { q?: string; tag?: string; month?: string; day?: string }) => {
    const params = new URLSearchParams()
    const next = {
      q: updates.q !== undefined ? updates.q : query,
      tag: updates.tag !== undefined ? updates.tag : tag,
      month: updates.month !== undefined ? updates.month : month,
      day: updates.day !== undefined ? updates.day : day,
    }

    if (next.q) params.set("q", next.q)
    if (next.tag) params.set("tag", next.tag)
    if (next.month) params.set("month", next.month)
    if (next.day) params.set("day", next.day)

    const queryString = params.toString()
    return queryString ? `/blog?${queryString}` : "/blog"
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          所有文章
        </h1>
        <p className="text-lg text-slate-400">
          {siteConfig.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline">总计 {allPosts.length} 篇</Badge>
          {query && <Badge variant="secondary">关键词: {query}</Badge>}
          {tag && <Badge variant="secondary">标签: {tag}</Badge>}
          {month && <Badge variant="secondary">月份: {month}</Badge>}
          {day && <Badge variant="secondary">日期: {day}</Badge>}
          {hasFilters && (
            <Link
              href="/blog"
              className="ml-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              清空全部筛选
            </Link>
          )}
        </div>
      </div>

      <BlogFilters
        tags={tagStats}
        archives={archiveStats}
        initialQuery={query}
        initialTag={tag}
        initialMonth={month}
        resultCount={filteredPosts.length}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section>
          {pagePosts.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                {pagePosts.map((post, index) => (
                  <ArticleCard key={post.slug} post={post} index={index} />
                ))}
              </div>
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                query={query || undefined}
                tag={tag || undefined}
                month={month || undefined}
              />
            </>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-10 text-center">
              <SearchX className="mx-auto h-8 w-8 text-slate-500" />
              <h2 className="mt-4 text-xl font-semibold text-white">没有匹配的文章</h2>
              <p className="mt-2 text-slate-400">
                调整关键词或筛选条件，查看更多内容。
              </p>
              <Link
                href="/blog"
                className="mt-5 inline-flex rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500 transition-colors"
              >
                返回全部文章
              </Link>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <FolderOpen className="h-4 w-4 text-cyan-400" />
              标签分类
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {tagStats.map((item) => {
                const active = item.tag === tag
                return (
                  <Link
                    key={item.tag}
                    href={createFilterHref({ tag: active ? "" : item.tag })}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      active
                        ? "border-cyan-500/70 bg-cyan-500/20 text-cyan-300"
                        : "border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    {item.tag} {item.count}
                  </Link>
                )
              })}
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <CalendarDays className="h-4 w-4 text-violet-400" />
              月份归档
            </h2>
            <div className="mt-3 space-y-2">
              {archiveStats.map((item) => {
                const active = item.key === month
                return (
                  <Link
                    key={item.key}
                    href={createFilterHref({ month: active ? "" : item.key })}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors ${
                      active
                        ? "border-violet-500/60 bg-violet-500/20 text-violet-200"
                        : "border-slate-800 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-slate-500">{item.count}</span>
                  </Link>
                )
              })}
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <CalendarDays className="h-4 w-4 text-emerald-400" />
              日期归档
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {dayStats.map((item) => {
                const active = item.key === day
                return (
                  <Link
                    key={item.key}
                    href={createFilterHref({ day: active ? "" : item.key })}
                    className={`flex items-center justify-between rounded-lg border px-2 py-1.5 text-[10px] transition-colors ${
                      active
                        ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-200"
                        : "border-slate-800 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <span>{item.key.slice(5)}</span>
                    <span className="opacity-50">{item.count}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
