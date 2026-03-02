"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function WhitehatTerminalPage() {
  const [terminalId, setTerminalId] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminalId(Math.random().toString(16).substring(2, 10).toUpperCase())
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleSocialLogin = async (provider: 'twitter' | 'discord') => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Error logging in:', error.message)
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
          <span className="text-white font-bold">CODEESURA // V2</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[10px] text-[#aaa] tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            SYSTEM: ONLINE
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
              WHITEHAT <br />
              <span className="text-[#222] hover:text-[#999] transition-colors cursor-default">RESCUE OPS.</span>
            </h1>
            <p className="text-base md:text-xl text-[#aaa] font-light max-w-2xl leading-relaxed">
              A compromised key doesn&apos;t mean total loss. I specialize in <span className="text-white">rescuing assets from sweeper-compromised wallets</span> across all EVM chains — including locked staking positions, pending airdrops, and vesting contracts.
            </p>
          </div>

          {/* MOBILE ONLY: LOGIN BUTTONS (Shown here on mobile, hidden on desktop) */}
          <div className="lg:hidden mb-12 border-t border-[#1a1a1a] pt-8">
            <LoginPanel onLogin={handleSocialLogin} />
          </div>

          {/* DETAILED PROCESS GRID */}
          <div className="flex flex-col gap-10 border-t border-[#1a1a1a] pt-10 pb-8 lg:pb-0 lg:mt-auto">

            {/* Step 01 */}
            <div className="space-y-3">
              <div className="text-[#999] text-4xl font-black">01</div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs">
                Submit Your Wallet
              </h2>
              <p className="text-[11px] text-[#999] leading-relaxed text-justify">
                Provide the private key of your compromised wallet. The key is <span className="text-white">encrypted on the server</span> before storage and cannot be read by anyone except me. Your wallet address is automatically derived from the key.
              </p>
            </div>

            {/* Step 02 */}
            <div className="space-y-3">
              <div className="text-[#999] text-4xl font-black">02</div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs">
                Ownership Verification
              </h2>
              <p className="text-[11px] text-[#999] leading-relaxed text-justify">
                The first funding transaction of your wallet is automatically traced across all EVM chains. If it was funded from a known exchange, you&apos;ll be asked to upload the original withdrawal email (.eml) for <span className="text-white">cryptographic verification</span>.
              </p>
            </div>

            {/* Step 03 */}
            <div className="space-y-3">
              <div className="text-[#999] text-4xl font-black">03</div>
              <h2 className="text-white font-bold uppercase tracking-widest text-xs">
                Asset Rescue
              </h2>
              <p className="text-[11px] text-[#999] leading-relaxed text-justify">
                Once ownership is confirmed, a counter-sweeper strategy is executed to extract your assets — staked tokens, pending airdrops, vesting contracts — and transfer them to your designated safe wallet before the malicious bot can react.
              </p>
            </div>

          </div>
        </div>

        {/* --- RIGHT PANEL: DESKTOP ONLY --- */}
        <div className="hidden lg:flex lg:col-span-4 bg-[#080808] relative flex-col justify-center p-8 md:p-12 lg:border-l border-[#1a1a1a]">
          {/* Grid Overlay */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50 pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-sm mx-auto">
            <LoginPanel onLogin={handleSocialLogin} />
          </div>
        </div>

      </div>

      {/* --- BOTTOM FOOTER STRIP --- */}
      <footer className="relative z-20 border-t border-[#1a1a1a] bg-[#050505] py-4 px-6 md:px-8 flex flex-col md:flex-row justify-between items-center text-[9px] text-[#aaa] tracking-[0.2em] shrink-0 gap-2 md:gap-0">
        <div>ETH ISTANBUL // BLOCKCHAIN FORENSICS</div>
        <div className="flex items-center gap-6">
          <Link href="https://x.com/codeesura" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            TWITTER
          </Link>
          <Link href="mailto:contact@codeesura.dev" className="hover:text-white transition-colors">
            CONTACT@CODEESURA.DEV
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {terminalId && <span>SID: <span className="text-white">{terminalId}</span></span>}
          <span>ALL_SYSTEMS_GO</span>
        </div>
      </footer>

    </main>
  )
}

function LoginPanel({ onLogin }: { onLogin: (provider: 'twitter' | 'discord') => void }) {
  return (
    <div className="space-y-8">
      <div className="border-l-2 border-white pl-6 py-2">
        <h2 className="text-xl font-bold text-white tracking-widest uppercase">
          Initiate Rescue
        </h2>
        <p className="text-[10px] text-[#999] uppercase mt-1">
          Secure Whitehat Portal Access
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => onLogin('twitter')}
          className="w-full bg-[#050505] border border-[#222] text-[#aaa] hover:text-white hover:border-white hover:bg-black py-5 px-6 flex items-center justify-between transition-all duration-300 group cursor-pointer"
        >
          <span className="flex items-center gap-3 font-bold text-[10px] tracking-[0.2em] uppercase">
            <Image src="/twitter.svg" alt="X" width={16} height={16} className="w-4 h-4 invert opacity-70 group-hover:opacity-100 transition-opacity" /> Connect X.com
          </span>
          <span className="text-xs opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
        </button>

        <button
          onClick={() => onLogin('discord')}
          className="w-full bg-[#050505] border border-[#222] text-[#aaa] hover:text-white hover:border-white hover:bg-black py-5 px-6 flex items-center justify-between transition-all duration-300 group cursor-pointer"
        >
          <span className="flex items-center gap-3 font-bold text-[10px] tracking-[0.2em] uppercase">
            <Image src="/discord.svg" alt="Discord" width={16} height={16} className="w-4 h-4 invert opacity-70 group-hover:opacity-100 transition-opacity" /> Connect Discord
          </span>
          <span className="text-xs opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
        </button>
      </div>

      <p className="text-[9px] text-[#999] uppercase leading-relaxed text-center">
        Encrypted session established. <br /> All credentials are securely protected.
      </p>
    </div>
  )
}