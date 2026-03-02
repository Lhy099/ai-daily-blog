export const siteConfig = {
  name: "AI Daily",
  tagline: "每日精选 AI 新闻与大模型技术前沿",
  description: "专注于人工智能、大模型、深度学习的技术博客，每日更新全球 AI 动态、论文解读与算法进展",
  url: "https://ai-daily-blog.vercel.app",
  author: "Lhy099",
  
  nav: {
    links: [
      { label: "首页", href: "/" },
      { label: "文章", href: "/blog" },
      { label: "关于", href: "/about" },
    ],
  },
  
  social: {
    github: "https://github.com/Lhy099",
    twitter: "#",
    email: "mailto:your@email.com",
  },
  
  newsletter: {
    title: "订阅 AI Daily",
    description: "每周精选 AI 资讯，直达邮箱",
  },
}

export type SiteConfig = typeof siteConfig
