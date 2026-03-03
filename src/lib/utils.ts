import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const hasTime = dateStr.includes('T') || dateStr.includes(':')
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(hasTime ? { hour: "2-digit", minute: "2-digit" } : {})
  }
  return date.toLocaleDateString("zh-CN", options)
}

export function formatOnlyDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatOnlyTime(dateStr: string): string {
  const date = new Date(dateStr)
  // 如果没有具体时间且是午夜，可能只是日期
  if (date.getHours() === 0 && date.getMinutes() === 0 && !dateStr.includes('T') && !dateStr.includes(':')) {
    return "--:--"
  }
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })
}

export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} 分钟阅读`
}
