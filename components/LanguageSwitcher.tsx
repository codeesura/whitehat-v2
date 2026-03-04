"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

const localeLabels: Record<string, string> = {
  en: "English",
  tr: "Türkçe",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ru: "Русский",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ar: "العربية",
  hi: "हिन्दी",
  vi: "Tiếng Việt",
  th: "ไทย",
  id: "Indonesia",
  tl: "Filipino",
  uk: "Українська",
  fa: "فارسی",
  pl: "Polski",
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus()
    }
  }, [open])

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) {
      setOpen(false)
      setSearch("")
      return
    }
    router.replace(pathname, { locale: newLocale })
    setOpen(false)
    setSearch("")
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return routing.locales
    const q = search.toLowerCase()
    return routing.locales.filter((l) => {
      return (
        l.toLowerCase().includes(q) ||
        (localeLabels[l] ?? "").toLowerCase().includes(q)
      )
    })
  }, [search])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 border border-[#222] hover:border-[#444] text-[10px] text-[#999] hover:text-white tracking-widest transition-all cursor-pointer"
      >
        <span>{localeLabels[locale] ?? locale.toUpperCase()}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-[#0a0a0a] border border-[#222] shadow-xl shadow-black/50 z-50 flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-[#1a1a1a]">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-[#111] border border-[#222] focus:border-[#444] px-2.5 py-1.5 text-[10px] text-white placeholder-[#666] outline-none font-mono"
            />
          </div>

          {/* Language list */}
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-[10px] text-[#666] text-center">
                No results
              </div>
            ) : (
              filtered.map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLocale(l)}
                    className={`w-full text-left px-3 py-2 text-[10px] flex items-center gap-2.5 transition-colors cursor-pointer ${
                      l === locale
                        ? "text-white bg-white/10"
                        : "text-[#999] hover:text-white hover:bg-[#111]"
                    }`}
                  >
                    <span className="text-[#666] uppercase w-5 shrink-0">{l}</span>
                    <span className="tracking-wide">{localeLabels[l] ?? l.toUpperCase()}</span>
                    {l === locale && (
                      <svg className="w-3 h-3 ml-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
