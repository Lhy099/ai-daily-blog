"use client"

import { useState, useEffect } from "react"

// A simple deterministic hash for strings to simulate varied view counts
const getStringHash = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash)
}

export function useViewCount(slug: string, increment = false) {
  const [views, setViews] = useState<number>(0)

  useEffect(() => {
    // 1. Initial base view count based on slug hash
    const baseViews = (getStringHash(slug) % 150) + 10 // Mock popularity

    // 2. Get local views from localStorage
    const storageKey = `post-views-${slug}`
    const localViews = Number.parseInt(localStorage.getItem(storageKey) || "0", 10)

    if (increment && !sessionStorage.getItem(storageKey)) {
      // Increment once per session to simulate real hits
      const newLocalViews = localViews + 1
      localStorage.setItem(storageKey, newLocalViews.toString())
      sessionStorage.setItem(storageKey, "true")
      setViews(baseViews + newLocalViews)
    } else {
      setViews(baseViews + localViews)
    }
  }, [slug, increment])

  return views
}
