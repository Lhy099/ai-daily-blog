import Link from "next/link"
import { siteConfig } from "@/config/site"
import { Github, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500" />
              <span className="text-xl font-bold text-white">{siteConfig.name}</span>
            </Link>
            <p className="text-slate-400 max-w-sm">
              {siteConfig.description}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">导航</h4>
            <ul className="space-y-2">
              {siteConfig.nav.links.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">联系</h4>
            <div className="flex gap-4">
              <a 
                href={siteConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href={siteConfig.social.email}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} {siteConfig.name}. 保留所有权利。
        </div>
      </div>
    </footer>
  )
}
