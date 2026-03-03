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

const GITHUB_REPO = "Lhy099/boba-github.io"
const GITHUB_BRANCH = "main"
const POSTS_PATH = "content/posts"

// 移除原本写死的 3 篇文章，只留一个空数组作为 Fallback
// 这样如果前端还是显示那 3 篇，说明 Vercel 根本没有部署新的代码
export const posts: BlogPost[] = []

// 从 GitHub 获取文章列表
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${POSTS_PATH}?ref=${GITHUB_BRANCH}`,
      { 
        next: { revalidate: 30 },
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        }
      }
    )
    
    if (!response.ok) {
      console.error('Failed to fetch posts from GitHub API:', response.status)
      return posts
    }
    
    const files = await response.json()
    
    // 过滤出 .md 文件
    const mdFiles = files.filter((file: any) => 
      file.name.endsWith('.md') && 
      file.name !== 'hello.md' &&
      file.type === 'file'
    )
    
    // 获取每篇文章内容
    const fetchedPosts = await Promise.all(
      mdFiles.map(async (file: any) => {
        try {
          const contentRes = await fetch(file.download_url, { next: { revalidate: 30 } })
          if (!contentRes.ok) return null
          const content = await contentRes.text()
          return parsePostContent(file.name, content)
        } catch (e) {
          console.error(`Failed to fetch content for ${file.name}:`, e)
          return null
        }
      })
    )
    
    const validPosts = fetchedPosts.filter((p): p is BlogPost => p !== null)
    
    // 按日期倒序排列
    return validPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Critical error in getAllPosts:', error)
    return posts
  }
}

// 获取单篇文章
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${POSTS_PATH}/${slug}.md`,
      { next: { revalidate: 30 } }
    )
    
    if (!response.ok) {
      console.warn(`Post not found on GitHub: ${slug}`)
      return null
    }
    
    const content = await response.text()
    return parsePostContent(`${slug}.md`, content)
  } catch (error) {
    console.error(`Error fetching post by slug ${slug}:`, error)
    return null
  }
}

// 解析 Markdown 内容 - 终极稳健版
function parsePostContent(filename: string, content: string): BlogPost {
  const slug = filename.replace('.md', '')
  
  // 1. 尝试匹配 YAML Frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  
  if (!frontmatterMatch) {
    // 如果没有 Frontmatter，尝试从正文第一行提取标题
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
  
  // 提取标题：支持 title: "xxx" 或 title: xxx
  const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n\r]+)["']?/)
  const title = titleMatch?.[1]?.trim() || slug
  
  // 提取日期：支持 date: 2026-03-02 或 date: "2026-03-02"
  const dateMatch = frontmatter.match(/date:\s*["']?(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch?.[1] || extractDateFromContent(content, slug)
  
  // 提取摘要
  const excerptMatch = frontmatter.match(/excerpt:\s*["']?([^"'\n\r]+)["']?/)
  const excerpt = excerptMatch?.[1]?.trim() || body.trim().slice(0, 150).replace(/\n/g, ' ') + '...'
  
  // 提取标签：支持 [a, b] 格式或列表格式
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

// 辅助函数：从内容或文件名中提取日期
function extractDateFromContent(content: string, slug: string): string {
  // 1. 尝试从文件名开头匹配日期 (2026-03-02-xxx)
  const slugDateMatch = slug.match(/^(\d{4}-\d{2}-\d{2})/)
  if (slugDateMatch) return slugDateMatch[1]
  
  // 2. 尝试从正文内容匹配日期
  const bodyDateMatch = content.match(/(\d{4}-\d{2}-\d{2})/)
  if (bodyDateMatch) return bodyDateMatch[1]
  
  return new Date().toISOString().split('T')[0]
}

// 辅助函数：计算阅读时间
function calculateReadTime(content: string): string {
  const wordCount = content.trim().length
  const minutes = Math.ceil(wordCount / 400) // 假设每分钟读 400 字
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
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh-CN"))
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

  if (!currentPost) {
    return []
  }

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
