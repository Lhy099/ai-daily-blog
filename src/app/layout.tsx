import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { siteConfig } from "@/config/site"

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["AI", "人工智能", "大模型", "机器学习", "深度学习"],
  authors: [{ name: siteConfig.author }],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.className} antialiased bg-slate-950`}>
        {children}
      </body>
    </html>
  )
}
