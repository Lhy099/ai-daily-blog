import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  
  // 检查是否有具体时间 (如果是 00:00:00 则可能是默认日期)
  const hasTime = dateStr.includes('T') || dateStr.includes(':')
  
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(hasTime ? { hour: "2-digit", minute: "2-digit" } : {})
  }
  
  return date.toLocaleDateString("zh-CN", options)
}

export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} 分钟阅读`
}
