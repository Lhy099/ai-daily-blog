import fs from 'fs'
import path from 'path'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  readTime: string
  content: string
  views?: number
}

export interface TagStat {
  tag: string
  count: number
}

export interface ArchiveStat {
  key: string
  label: string
  count: number
}

export interface PostFilters {
  query?: string
  tag?: string
  month?: string
}

const POSTS_DIRECTORY = path.join(process.cwd(), 'content/posts')

// 获取文章列表 - 从本地文件系统读取
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    if (!fs.existsSync(POSTS_DIRECTORY)) {
      console.warn(`Directory not found: ${POSTS_DIRECTORY}`)
      return []
    }

    const fileNames = fs.readdirSync(POSTS_DIRECTORY)
    
    const fetchedPosts = fileNames
      .filter(fileName => fileName.endsWith('.md') && fileName !== 'hello.md')
      .map(fileName => {
        const fullPath = path.join(POSTS_DIRECTORY, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        return parsePostContent(fileName, fileContents)
      })
    
    // 按日期/时间倒序排列 (最新时间在前)
    return fetchedPosts.sort((a, b) => {
      const timeA = new Date(a.date).getTime()
      const timeB = new Date(b.date).getTime()
      
      if (timeB !== timeA) {
        return timeB - timeA
      }
      
      return b.slug.localeCompare(a.slug)
    })
  } catch (error) {
    console.error('Error reading posts from local filesystem:', error)
    return []
  }
}

// 获取单篇文章
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(POSTS_DIRECTORY, `${slug}.md`)
    if (!fs.existsSync(fullPath)) {
      return null
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    return parsePostContent(`${slug}.md`, fileContents)
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error)
    return null
  }
}

// 解析 Markdown 内容
function parsePostContent(filename: string, content: string): BlogPost {
  const slug = filename.replace('.md', '')
  
  // 1. 尝试匹配 YAML Frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  
  if (!frontmatterMatch) {
    const firstLine = content.split('\n')[0].replace(/^#\s*/, '').trim()
    return {
      slug,
      title: firstLine || slug,
      excerpt: content.split('\n').slice(1, 4).join(' ').slice(0, 150) + '...',
      date: extractDateFromContent(content, slug),
      tags: [],
      readTime: calculateReadTime(content),
      content: content.trim()
    }
  }
  
  const [, frontmatter, body] = frontmatterMatch
  
  const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n\r]+)["']?/)
  const title = titleMatch?.[1]?.trim() || slug
  
  const dateMatch = frontmatter.match(/date:\s*["']?(\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}:\d{2})?)["']?/)
  const date = dateMatch?.[1] || extractDateFromContent(content, slug)
  
  const excerptMatch = frontmatter.match(/excerpt:\s*["']?([^"'\n\r]+)["']?/)
  const excerpt = excerptMatch?.[1]?.trim() || body.trim().slice(0, 150).replace(/\n/g, ' ') + '...'
  
  let tags: string[] = []
  const tagsInlineMatch = frontmatter.match(/tags:\s*\[?([^\]\n\r]*)\]?/)
  if (tagsInlineMatch && tagsInlineMatch[1].trim()) {
    tags = tagsInlineMatch[1].split(/,/).map(t => t.trim().replace(/["']/g, '')).filter(Boolean)
  } else {
    const tagsListMatch = frontmatter.match(/tags:\s*\n([\s\S]*?)(?=\n\w+:|---)/)
    if (tagsListMatch) {
      tags = tagsListMatch[1].split('\n').map(line => line.trim().replace(/^-\s*/, '')).filter(Boolean)
    }
  }
  
  return {
    slug,
    title,
    excerpt,
    date,
    tags,
    readTime: calculateReadTime(body),
    content: body.trim()
  }
}

function extractDateFromContent(content: string, slug: string): string {
  const slugDateMatch = slug.match(/^(\d{4}-\d{2}-\d{2})/)
  if (slugDateMatch) return slugDateMatch[1]
  
  const bodyDateMatch = content.match(/(\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}:\d{2})?)/)
  if (bodyDateMatch) return bodyDateMatch[1]
  
  return new Date().toISOString()
}

function calculateReadTime(content: string): string {
  const wordCount = content.trim().length
  const minutes = Math.ceil(wordCount / 400)
  return `${minutes} 分钟`
}

export function getTagStats(allPosts: BlogPost[]): TagStat[] {
  const counter = new Map<string, number>()
  for (const post of allPosts) {
    for (const tag of post.tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1)
    }
  }
  return [...counter.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(tag, "zh-CN"))
}

export function getArchiveStats(allPosts: BlogPost[]): ArchiveStat[] {
  const counter = new Map<string, number>()
  for (const post of allPosts) {
    const key = post.date.slice(0, 7)
    counter.set(key, (counter.get(key) ?? 0) + 1)
  }
  return [...counter.entries()]
    .map(([key, count]) => {
      const [year, month] = key.split("-")
      const date = new Date(Number(year), Number(month) - 1, 1)
      return {
        key,
        count,
        label: date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
        }),
      }
    })
    .sort((a, b) => b.key.localeCompare(a.key))
}

export function filterPostsBy(input: BlogPost[], filters: PostFilters): BlogPost[] {
  const query = filters.query?.trim().toLowerCase()
  const tag = filters.tag?.trim()
  const month = filters.month?.trim()

  return input.filter((post) => {
    const matchesQuery = !query
      ? true
      : [post.title, post.excerpt, post.content, post.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(query)

    const matchesTag = !tag ? true : post.tags.includes(tag)
    const matchesMonth = !month ? true : post.date.startsWith(month)

    return matchesQuery && matchesTag && matchesMonth
  })
}

export function getRelatedPosts(slug: string, allPosts: BlogPost[], limit = 3): BlogPost[] {
  const currentPost = allPosts.find(p => p.slug === slug)
  if (!currentPost) return []

  const candidates = allPosts.filter((post) => post.slug !== slug)
  const withSharedTag = candidates
    .map((post) => ({
      post,
      sharedTagCount: post.tags.filter((tag) => currentPost.tags.includes(tag)).length,
    }))
    .filter((item) => item.sharedTagCount > 0)
    .sort(
      (a, b) =>
        b.sharedTagCount - a.sharedTagCount ||
        new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
    )
    .map((item) => item.post)

  if (withSharedTag.length >= limit) {
    return withSharedTag.slice(0, limit)
  }

  const fallback = candidates
    .filter((post) => !withSharedTag.some((item) => item.slug === post.slug))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return [...withSharedTag, ...fallback].slice(0, limit)
}
