import fs from 'fs'
import path from 'path'
import { BlogPost, parsePostContent } from '@/posts/data'

const POSTS_DIRECTORY = path.join(process.cwd(), 'content/posts')

// 获取文章列表 - 仅服务端可用
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

// 获取单篇文章 - 仅服务端可用
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
