const GITHUB_REPO = "Lhy099/boba-github.io"
const GITHUB_BRANCH = "main"
const POSTS_PATH = "content/posts"

export interface Post {
  slug: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  readTime: string
  content: string
}

// 从 GitHub 获取文章列表
export async function getAllPosts(): Promise<Post[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${POSTS_PATH}?ref=${GITHUB_BRANCH}`,
      { next: { revalidate: 3600 } } // 1小时缓存
    )
    
    if (!response.ok) {
      console.error('Failed to fetch posts:', response.status)
      return getFallbackPosts()
    }
    
    const files = await response.json()
    
    // 过滤出 .md 文件
    const mdFiles = files.filter((file: any) => 
      file.name.endsWith('.md') && file.name !== 'hello.md'
    )
    
    // 获取每篇文章内容
    const posts = await Promise.all(
      mdFiles.map(async (file: any) => {
        try {
          const contentRes = await fetch(file.download_url)
          const content = await contentRes.text()
          return parsePostContent(file.name, content)
        } catch (e) {
          console.error(`Failed to fetch ${file.name}:`, e)
          return null
        }
      })
    )
    
    // 过滤掉失败的，按日期排序
    return posts
      .filter((p): p is Post => p !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error fetching posts:', error)
    return getFallbackPosts()
  }
}

// 获取单篇文章
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${POSTS_PATH}/${slug}.md`
    )
    
    if (!response.ok) return null
    
    const content = await response.text()
    return parsePostContent(`${slug}.md`, content)
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

// 解析 Markdown 内容
function parsePostContent(filename: string, content: string): Post {
  const slug = filename.replace('.md', '')
  
  // 解析 frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  
  if (!frontmatterMatch) {
    return {
      slug,
      title: slug,
      excerpt: content.slice(0, 100) + '...',
      date: new Date().toISOString(),
      tags: [],
      readTime: '5 分钟',
      content
    }
  }
  
  const [, frontmatter, body] = frontmatterMatch
  
  // 解析各个字段
  const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/)
  const dateMatch = frontmatter.match(/date:\s*(\S+)/)
  const excerptMatch = frontmatter.match(/excerpt:\s*"([^"]+)"/)
  const tagsMatch = frontmatter.match(/tags:\s*\n([\s\S]*?)(?=\ncategories:|\n---)/)
  
  const title = titleMatch?.[1] || slug
  const date = dateMatch?.[1] || new Date().toISOString()
  const excerpt = excerptMatch?.[1] || body.slice(0, 150) + '...'
  
  // 解析标签
  const tags = tagsMatch 
    ? tagsMatch[1].split('\n').map(line => line.trim().replace(/^-\s*/, '')).filter(Boolean)
    : []
  
  // 计算阅读时间
  const wordCount = body.split(/\s+/).length
  const readTime = `${Math.ceil(wordCount / 200)} 分钟`
  
  return {
    slug,
    title,
    excerpt,
    date,
    tags,
    readTime,
    content: body.trim()
  }
}

// 备用文章（当 GitHub 请求失败时）
function getFallbackPosts(): Post[] {
  return [
    {
      slug: "ai-china-surpass-us",
      title: "AI日报：中国大模型调用量首超美国，四款模型霸榜全球前五",
      excerpt: "2026年2月，中国AI产业迎来里程碑时刻——中国AI模型调用量首次超越美国。",
      date: "2026-03-02",
      tags: ["AI新闻", "大模型", "中国AI"],
      readTime: "5 分钟",
      content: "内容加载中..."
    },
    {
      slug: "ai-funding-record",
      title: "AI日报：OpenAI创纪录融资1100亿美元",
      excerpt: "OpenAI完成1100亿美元融资，刷新全球私营科技公司单笔融资纪录。",
      date: "2026-03-02",
      tags: ["AI融资", "OpenAI"],
      readTime: "6 分钟",
      content: "内容加载中..."
    }
  ]
}
