"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default function WhitehatTerminalPage() {
  const [terminalId, setTerminalId] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const t = useTranslations()

  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminalId(Math.random().toString(16).substring(2, 10).toUpperCase())
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleSocialLogin = async (provider: 'twitter' | 'discord') => {
    setLoginError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Error logging in:', error.message)
      setLoginError(t("Landing.login.loginFailed", { error: error.message }))
    }
  }


  return (
    <main className="min-h-screen lg:h-screen w-full bg-[#050505] text-[#e5e5e5] font-mono selection:bg-white selection:text-black relative flex flex-col overflow-x-hidden lg:overflow-hidden">

      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.7%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E')]"></div>
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* --- HEADER BAR --- */}
      <header className="relative z-20 w-full px-6 py-5 md:px-8 md:py-6 border-b border-[#1a1a1a] bg-[#050505]/80 backdrop-blur-md flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4 text-[10px] md:text-xs tracking-[0.3em] text-[#999] uppercase">
          <span className="w-6 md:w-8 h-[1px] bg-[#333]"></span>
          <span className="text-white font-bold">{t("Common.brand")}</span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <div className="hidden md:flex items-center gap-3 text-[10px] text-[#aaa] tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {t("Common.systemOnline")}
            </div>
          </div>
        </div>
      </header>

      {/* --- CONTENT GRID --- */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12">

        {/* --- LEFT PANEL --- */}
        <div className="lg:col-span-8 p-6 md:p-12 lg:p-16 flex flex-col border-b lg:border-b-0 lg:border-r border-[#1a1a1a] lg:overflow-y-auto lg:no-scrollbar">

          {/* HERO HEADER */}
          <div className="mb-8 lg:mb-12 mt-4 lg:mt-auto">
            <h1 className="text-5xl sm:text-6xl md:text-8xl xl:text-9xl font-black tracking-[-0.05em] text-white leading-[0.9] md:leading-[0.85] mb-6">
              {t("Landing.hero.title1")} <br />
              <span className="text-[#222] hover:text-[#999] transition-colors cursor-default">{t("Landing.hero.title2")}</span>
            </h1>
            <p className="text-base md:text-xl text-[#aaa] font-light max-w-2xl leading-relaxed">
              {t.rich("Landing.hero.description", {
                highlight: (chunks) => <span className="text-white">{chunks}</span>,
              })}
            </p>
          </div>

          {/* MOBILE ONLY: LOGIN BUTTONS */}
          <div className="lg:hidden mb-12 border-t border-[#1a1a1a] pt-8">
            <LoginPanel onLogin={handleSocialLogin} loginError={loginError} />
          </div>

          {/* DETAILED PROCESS GRID */}
          <div className="flex flex-col gap-10 border-t border-[#1a1a1a] pt-10 pb-8 lg:pb-0 lg:mt-auto">

            {/* Step 01 */}
            <div className="space-y-3">
              <div className="text-[#999] text-4xl font-black">{t("Landing.steps.step01.number")}</div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs">
                {t("Landing.steps.step01.title")}
              </h2>
              <p className="text-[11px] text-[#999] leading-relaxed text-justify">
                {t.rich("Landing.steps.step01.description", {
                  highlight: (chunks) => <span className="text-white">{chunks}</span>,
                })}
              </p>
            </div>

            {/* Step 02 */}
            <div className="space-y-3">
              <div className="text-[#999] text-4xl font-black">{t("Landing.steps.step02.number")}</div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs">
                {t("Landing.steps.step02.title")}
              </h2>
              <p className="text-[11px] text-[#999] leading-relaxed text-justify">
                {t.rich("Landing.steps.step02.description", {
                  highlight: (chunks) => <span className="text-white">{chunks}</span>,
                })}
              </p>
            </div>

            {/* Step 03 */}
            <div className="space-y-3">
              <div className="text-[#999] text-4xl font-black">{t("Landing.steps.step03.number")}</div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs">
                {t("Landing.steps.step03.title")}
              </h2>
              <p className="text-[11px] text-[#999] leading-relaxed text-justify">
                {t("Landing.steps.step03.description")}
              </p>
            </div>

          </div>
        </div>

        {/* --- RIGHT PANEL: DESKTOP ONLY --- */}
        <div className="hidden lg:flex lg:col-span-4 bg-[#080808] relative flex-col justify-center p-8 md:p-12 lg:border-l border-[#1a1a1a]">
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50 pointer-events-none"></div>
          <div className="relative z-10 w-full max-w-sm mx-auto">
            <LoginPanel onLogin={handleSocialLogin} loginError={loginError} />
          </div>
        </div>

      </div>

      {/* --- BOTTOM FOOTER STRIP --- */}
      <footer className="relative z-20 border-t border-[#1a1a1a] bg-[#050505] py-4 px-6 md:px-8 flex flex-col md:flex-row justify-between items-center text-[9px] text-[#aaa] tracking-[0.2em] shrink-0 gap-2 md:gap-0">
        <div>{t("Common.footer.location")}</div>
        <div className="flex items-center gap-6">
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            PRIVACY POLICY
          </a>
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            TERMS OF SERVICE
          </a>
          <a href="https://x.com/codeesura" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            {t("Common.footer.twitter")}
          </a>
          <a href="mailto:contact@codeesura.dev" className="hover:text-white transition-colors">
            CONTACT@CODEESURA.DEV
          </a>
        </div>
        <div className="flex items-center gap-4">
          {terminalId && <span>SID: <span className="text-white">{terminalId}</span></span>}
          <span>{t("Common.footer.allSystems")}</span>
        </div>
      </footer>

    </main>
  )
}

function LoginPanel({ onLogin, loginError }: { onLogin: (provider: 'twitter' | 'discord') => void, loginError: string | null }) {
  const [agreedToTerms, setAgreedToTerms] = useState(true)
  const t = useTranslations("Landing.login")
  return (
    <div className="space-y-8">
      <div className="border-l-2 border-white pl-6 py-2">
        <h2 className="text-xl font-bold text-white tracking-widest uppercase">
          {t("title")}
        </h2>
        <p className="text-[10px] text-[#999] uppercase mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Terms consent checkbox */}
      <div
        onClick={() => setAgreedToTerms(!agreedToTerms)}
        className="flex items-start gap-3 cursor-pointer select-none"
      >
        <div className={`mt-0.5 w-4 h-4 shrink-0 border flex items-center justify-center transition-all duration-200 ${agreedToTerms ? "border-[#555] bg-transparent" : "border-[#333] bg-transparent hover:border-[#555]"}`}>
          {agreedToTerms && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-[#888]">
              <path d="M2 5L4.5 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          )}
        </div>
        <span className="text-[10px] text-[#999] leading-relaxed">
          {t.rich("agreeTerms", {
            terms: (chunks) => (
              <a href="/terms" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-white underline underline-offset-2 hover:text-[#ccc] transition-colors">
                {chunks}
              </a>
            ),
            privacy: (chunks) => (
              <a href="/privacy" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-white underline underline-offset-2 hover:text-[#ccc] transition-colors">
                {chunks}
              </a>
            ),
          })}
        </span>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => onLogin('twitter')}
          disabled={!agreedToTerms}
          className={`w-full bg-[#050505] border border-[#222] text-[#aaa] py-5 px-6 flex items-center justify-between transition-all duration-300 group ${agreedToTerms ? "hover:text-white hover:border-white hover:bg-black cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
        >
          <span className="flex items-center gap-3 font-bold text-[10px] tracking-[0.2em] uppercase">
            <Image src="/twitter.svg" alt="X" width={16} height={16} className="w-4 h-4 invert opacity-70 group-hover:opacity-100 transition-opacity" /> {t("connectX")}
          </span>
          <span className="text-xs opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
        </button>

        <button
          onClick={() => onLogin('discord')}
          disabled={!agreedToTerms}
          className={`w-full bg-[#050505] border border-[#222] text-[#aaa] py-5 px-6 flex items-center justify-between transition-all duration-300 group ${agreedToTerms ? "hover:text-white hover:border-white hover:bg-black cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
        >
          <span className="flex items-center gap-3 font-bold text-[10px] tracking-[0.2em] uppercase">
            <Image src="/discord.svg" alt="Discord" width={16} height={16} className="w-4 h-4 invert opacity-70 group-hover:opacity-100 transition-opacity" /> {t("connectDiscord")}
          </span>
          <span className="text-xs opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
        </button>
      </div>

      {loginError && (
        <p className="text-[10px] text-red-500 text-center">{loginError}</p>
      )}

      <p className="text-[9px] text-[#999] uppercase leading-relaxed text-center">
        {t.rich("sessionNote", {
          br: () => <br />,
        })}
      </p>
    </div>
  )
}
