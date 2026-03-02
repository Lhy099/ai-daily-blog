import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // 允许在静态导出时获取数据
  experimental: {
    dynamicIO: true,
  },
}

export default nextConfig
