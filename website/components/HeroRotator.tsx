'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Country } from '@/lib/countries'
import type { DigestContent } from '@/lib/digests'
import { formatDate } from '@/lib/digests'

export interface HeroItem {
  country: Country
  content: DigestContent
  title: string
}

export default function HeroRotator({ items }: { items: HeroItem[] }) {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (items.length <= 1) return
    const random = Math.floor(Math.random() * items.length)
    if (random === idx) return
    // Brief fade-out, swap, fade-in — keeps layout stable
    setVisible(false)
    const t = setTimeout(() => {
      setIdx(random)
      setVisible(true)
    }, 120)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount

  const item = items[idx]
  if (!item) return null

  return (
    <section className="bg-white border-b border-slate-200">
      <div
        className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 120ms ease-in-out',
        }}
      >
        <div className="flex items-center gap-8 md:gap-16">
          {/* Left: text */}
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600 mb-4 block">
              {item.country.flag}&nbsp; {item.country.name}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-slate-900 mb-4">
              {item.title || "Read Today's Analysis"}
            </h1>
            <p className="text-slate-500 text-sm mb-8">
              {formatDate(item.content.date)}
            </p>
            <Link
              href={`/${item.country.slug}/${item.content.date}`}
              className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-3 transition-colors"
            >
              Read Today&apos;s Digest →
            </Link>
          </div>
          {/* Right: large flag */}
          <div
            className="hidden sm:block shrink-0 leading-none select-none"
            style={{ fontSize: '10rem' }}
            aria-hidden="true"
          >
            {item.country.flag}
          </div>
        </div>
      </div>
    </section>
  )
}
