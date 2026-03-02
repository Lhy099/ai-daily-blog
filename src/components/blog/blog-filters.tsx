"use client"

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, CalendarDays, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ArchiveStat, TagStat } from "@/posts/data"

interface BlogFiltersProps {
  tags: TagStat[]
  archives: ArchiveStat[]
  initialQuery?: string
  initialTag?: string
  initialMonth?: string
  resultCount: number
}

export function BlogFilters({
  tags,
  archives,
  initialQuery = "",
  initialTag = "",
  initialMonth = "",
  resultCount,
}: BlogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  const hasFilters = Boolean(initialQuery || initialTag || initialMonth)

  const topTags = useMemo(() => tags.slice(0, 6), [tags])

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const updateUrl = (changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(changes)) {
      if (!value) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }

    params.delete("page")

    const nextQueryString = params.toString()
    const nextUrl = nextQueryString ? `${pathname}?${nextQueryString}` : pathname
    startTransition(() => router.push(nextUrl))
  }

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateUrl({ q: query.trim() || undefined })
  }

  const clearAll = () => {
    setQuery("")
    startTransition(() => router.push(pathname))
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6">
      <form onSubmit={onSearch} className="grid gap-4 md:grid-cols-[1fr_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索标题、摘要、标签..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
          />
        </label>
        <Button type="submit" className="gap-2" disabled={isPending}>
          <Search className="h-4 w-4" />
          搜索
        </Button>
      </form>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={initialTag}
            onChange={(event) => updateUrl({ tag: event.target.value || undefined })}
            className="w-full bg-transparent text-sm text-slate-200 focus:outline-none"
          >
            <option value="">全部标签</option>
            {tags.map((item) => (
              <option key={item.tag} value={item.tag}>
                {item.tag} ({item.count})
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          <select
            value={initialMonth}
            onChange={(event) => updateUrl({ month: event.target.value || undefined })}
            className="w-full bg-transparent text-sm text-slate-200 focus:outline-none"
          >
            <option value="">全部归档</option>
            {archives.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label} ({item.count})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {topTags.map((item) => {
          const active = initialTag === item.tag
          return (
            <button
              type="button"
              key={item.tag}
              onClick={() => updateUrl({ tag: active ? undefined : item.tag })}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                active
                  ? "border-cyan-500/60 bg-cyan-500/20 text-cyan-300"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
              }`}
            >
              {item.tag} {item.count}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4 text-sm">
        <p className="text-slate-400">
          当前匹配 <span className="text-cyan-400">{resultCount}</span> 篇文章
        </p>

        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clearAll} className="gap-1">
            <X className="h-3.5 w-3.5" />
            清除筛选
          </Button>
        )}
      </div>
    </section>
  )
}
