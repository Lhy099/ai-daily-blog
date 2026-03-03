import fs from 'fs'
import path from 'path'
import { BlogPost, parsePostContent } from '@/posts/data'

// 尝试多个可能的路径
const POSSIBLE_PATHS = [
  path.join(process.cwd(), 'content/posts'),
  path.join(process.cwd(), '../content/posts'),
  path.join(process.cwd(), '../../content/posts'),
  '/vercel/path0/content/posts', // Vercel默认路径
  path.resolve('./content/posts'),
]

function findPostsDirectory(): string | null {
  for (const dir of POSSIBLE_PATHS) {
    if (fs.existsSync(dir)) {
      console.log('[posts-server] Found posts directory:', dir)
      return dir
    }
  }
  console.error('[posts-server] Could not find posts directory. Tried:', POSSIBLE_PATHS)
  return null
}

// 获取文章列表 - 仅服务端可用
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const POSTS_DIRECTORY = findPostsDirectory()
    
    if (!POSTS_DIRECTORY) {
      console.warn('[posts-server] Directory not found, returning empty array')
      return []
    }

    const fileNames = fs.readdirSync(POSTS_DIRECTORY)
    console.log('[posts-server] Found files:', fileNames)
    
    const fetchedPosts = fileNames
      .filter(fileName => fileName.endsWith('.md') && fileName !== 'hello.md')
      .map(fileName => {
        const fullPath = path.join(POSTS_DIRECTORY, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        // 只进行内容解析，不依赖不可靠的本地文件系统 birthtime
        return parsePostContent(fileName, fileContents)
      })
    
    console.log('[posts-server] Parsed posts:', fetchedPosts.length)
    
    // 终极排序逻辑：
    // 1. 优先比较日期/时间戳
    // 2. 如果日期相同，比较文件名 (slug) 倒序排列。
    // 由于文件名通常包含 2026-03-03-ai-innovation 等关键词，同日的不同类别日报能有稳定的显示顺序。
    return fetchedPosts.sort((a, b) => {
      const timeA = new Date(a.date).getTime()
      const timeB = new Date(b.date).getTime()
      
      if (!isNaN(timeA) && !isNaN(timeB) && timeB !== timeA) {
        return timeB - timeA
      }
      
      // 日期完全相同或解析失败，按 slug 字母表倒序排列 (确保最新文件排在上面)
      return b.slug.localeCompare(a.slug)
    })
  } catch (error) {
    console.error('[posts-server] Error reading posts:', error)
    return []
  }
}

// 获取单篇文章 - 仅服务端可用
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const POSTS_DIRECTORY = findPostsDirectory()
    if (!POSTS_DIRECTORY) return null
    
    const fullPath = path.join(POSTS_DIRECTORY, `${slug}.md`)
    if (!fs.existsSync(fullPath)) {
      return null
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    return parsePostContent(`${slug}.md`, fileContents)
  } catch (error) {
    console.error(`[posts-server] Error fetching post ${slug}:`, error)
    return null
  }
}
