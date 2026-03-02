export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  readTime: string
  content: string
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

export const posts: BlogPost[] = [
  {
    slug: "ai-china-surpass-us",
    title: "AI日报：中国大模型调用量首超美国，四款模型霸榜全球前五",
    excerpt: "2026年2月，中国AI产业迎来里程碑时刻——中国AI模型调用量首次超越美国。平台调用量排名前五的模型中，四款来自中国厂商。",
    date: "2026-03-02",
    tags: ["AI新闻", "大模型", "中国AI"],
    readTime: "5 分钟",
    content: `
## 📰 今日 AI 要闻

### 中国 AI 大模型历史性突破

2026年2月，中国 AI 产业迎来里程碑时刻——**中国 AI 模型调用量首次超越美国**。据最新周榜单显示，平台调用量排名前五的模型中，**四款来自中国厂商**：

| 排名 | 模型 | 厂商 |
|------|------|------|
| 1 | M2.5 | MiniMax |
| 2 | Kimi K2.5 | 月之暗面 |
| 3 | GLM-5 | 智谱 |
| 4 | DeepSeek-R1 | DeepSeek |

这标志着中国在大模型应用落地方面已跻身全球第一梯队。

### 中国 AI 产业规模突破 1.2 万亿

根据新华社报道，截至2026年初：
- 🏢 AI 企业数量超过 **6000 家**
- 💰 AI 核心产业规模预计突破 **1.2 万亿元**，同比增长近 30%
- 📥 国产开源大模型全球累计下载量突破 **100 亿次**
- 📜 中国成为 **AI 专利最大持有国**

全球 AI 产业正从"集中式训练为主"转向"**推理落地与场景普惠**"的新阶段。

---

## 🔬 大模型论文与算法进展

### Transformer 架构的持续进化

自2017年《Attention Is All You Need》发表以来，Transformer 已成为大模型的标准架构。近期研究者在**注意力机制优化**方面取得重要突破：

#### 1. DCFormer：动态组合多头注意力

彩云科技提出的 **DCFormer** 在 ICML 2024 获得高分评价，通过改进多头注意力模块(MHA)，将 Transformer 的计算性能提升 **2 倍**。

**核心创新**：
- 动态组合注意力头，避免冗余计算
- 保持模型容量同时降低计算复杂度

#### 2. Infini-attention：无限上下文处理

Google 最新提出的 **Infini-attention** 技术，通过将压缩记忆集成到标准注意力机制中，实现了：
- 🔄 单个 Transformer 块同时构建局部注意力和长期注意力
- 📏 理论上可处理**无限长度**的输入序列
- 💾 显著降低长文本处理的内存占用

---

## 💡 技术趋势洞察

### 2026 年大模型发展预测

1. **模型效率优先**：从追求参数规模转向优化推理效率
2. **长上下文成为标配**：128K、1M 上下文窗口将普及
3. **国产模型崛起**：DeepSeek、Kimi、GLM 等持续迭代
4. **端侧部署加速**：小模型在手机、IoT 设备上广泛应用

*本文由 AI 自动生成，每日早上 7 点更新。*
    `
  },
  {
    slug: "transformer-evolution",
    title: "Transformer 架构演进：从 Attention 到 Infini-attention",
    excerpt: "深入探讨 Transformer 架构的演变历程，从 2017 年的 Attention Is All You Need 到最新的 Infini-attention 无限上下文技术。",
    date: "2026-03-01",
    tags: ["Transformer", "深度学习", "论文解读"],
    readTime: "8 分钟",
    content: `
## Transformer 架构简史

2017年，Google 在论文《Attention Is All You Need》中提出了 Transformer 架构，彻底改变了自然语言处理的技术范式。

### 核心创新：Self-Attention

Self-Attention 机制允许模型在处理序列时直接关注任意位置的元素，克服了 RNN 的顺序处理瓶颈。

### 最新进展

- **DCFormer**: 动态组合多头注意力，计算效率提升 2 倍
- **Infini-attention**: 无限上下文处理，打破序列长度限制
- **FlashAttention**: IO 感知的注意力优化，显著加速训练

### 未来方向

1. 更高效的注意力机制
2. 多模态融合
3. 推理时计算优化
    `
  },
  {
    slug: "llm-deployment-trends",
    title: "2026 大模型部署趋势：从云端到端侧",
    excerpt: "分析大模型部署的最新趋势，包括云端推理优化、端侧部署技术以及混合推理架构的发展。",
    date: "2026-02-28",
    tags: ["LLM", "部署", "边缘计算"],
    readTime: "6 分钟",
    content: `
## 大模型部署的演进

### 云端推理优化

- 模型并行与流水线并行
- 动态批处理 (Continuous Batching)
- KV Cache 优化

### 端侧部署技术

- 模型量化 (INT8, INT4)
- 知识蒸馏
- 移动端推理框架 (ML Kit, Core ML)

### 混合推理架构

结合云端和端侧的优势，实现：
- 低延迟响应
- 隐私保护
- 离线可用性
    `
  },
]

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug)
}

export function getAllPosts() {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getTagStats(): TagStat[] {
  const counter = new Map<string, number>()

  for (const post of posts) {
    for (const tag of post.tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1)
    }
  }

  return [...counter.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh-CN"))
}

export function getArchiveStats(): ArchiveStat[] {
  const counter = new Map<string, number>()

  for (const post of posts) {
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

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const currentPost = getPostBySlug(slug)

  if (!currentPost) {
    return []
  }

  const candidates = getAllPosts().filter((post) => post.slug !== slug)
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
