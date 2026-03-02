import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface BlogPaginationProps {
  currentPage: number
  totalPages: number
  query?: string
  tag?: string
  month?: string
}

function buildPageItems(currentPage: number, totalPages: number): Array<number | string> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  const sortedPages = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b)

  const items: Array<number | string> = []
  for (let index = 0; index < sortedPages.length; index++) {
    const page = sortedPages[index]
    const previous = sortedPages[index - 1]

    if (previous && page - previous > 1) {
      items.push(`dots-${previous}-${page}`)
    }
    items.push(page)
  }

  return items
}

export function BlogPagination({ currentPage, totalPages, query, tag, month }: BlogPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const createHref = (page: number) => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (tag) params.set("tag", tag)
    if (month) params.set("month", month)
    if (page > 1) params.set("page", String(page))
    const queryString = params.toString()
    return queryString ? `/blog?${queryString}` : "/blog"
  }

  const items = buildPageItems(currentPage, totalPages)

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={createHref(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm transition-colors ${
          currentPage === 1
            ? "pointer-events-none border-slate-800 text-slate-600"
            : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
        上一页
      </Link>

      {items.map((item) => {
        if (typeof item === "string") {
          return (
            <span key={item} className="px-2 text-slate-600">
              ...
            </span>
          )
        }

        const active = item === currentPage
        return (
          <Link
            key={item}
            href={createHref(item)}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm transition-colors ${
              active
                ? "border-cyan-500/70 bg-cyan-500/20 text-cyan-300"
                : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
            }`}
          >
            {item}
          </Link>
        )
      })}

      <Link
        href={createHref(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm transition-colors ${
          currentPage === totalPages
            ? "pointer-events-none border-slate-800 text-slate-600"
            : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
        }`}
      >
        下一页
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  )
}
