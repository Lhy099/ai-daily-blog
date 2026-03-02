import { motion } from "framer-motion"
import { siteConfig } from "@/config/site"
import { Navbar } from "@/components/blog/navbar"
import { Footer } from "@/components/blog/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Mail, Sparkles, Code, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              关于 {siteConfig.name}
            </h1>
            <p className="text-lg text-slate-400">
              {siteConfig.description}
            </p>
          </div>

          <div className="grid gap-8 mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-cyan-400" />
                  我们的使命
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-400">
                <p>
                  {siteConfig.name} 致力于追踪人工智能领域的最新动态，
                  为读者提供高质量的技术资讯和深度分析。
                  我们相信 AI 正在改变世界，而我们的使命是帮助更多人了解这场变革。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-violet-400" />
                  内容特色
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    每日精选全球 AI 新闻
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    大模型技术前沿追踪
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    学术论文深度解读
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    算法进展与工程实践
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Code className="h-6 w-6 text-emerald-400" />
                  技术栈
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui"].map((tech) => (
                    <span 
                      key={tech}
                      className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">联系我们</h2>
            
            <div className="flex justify-center gap-6">
              <a 
                href={siteConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                <Github className="h-5 w-5" />
                GitHub
              </a>
              
              <a 
                href={siteConfig.social.email}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                <Mail className="h-5 w-5" />
                邮箱
              </a>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
