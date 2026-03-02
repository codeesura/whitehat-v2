"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ethers } from "ethers"

// --- ICONS ---
const IconShield = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
)

const IconAlert = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
)

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

interface WalletSubmission {
    id: string
    compromised_address: string
    safe_wallet_address: string
    funding_tx_hash: string | null
    funding_cex_name: string | null
    eml_verified: boolean
    status: string
    created_at: string
}

export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()

    // --- STATE MANAGEMENT ---
    const [safeWallet, setSafeWallet] = useState<string>("")
    const [safeWalletUpdatedAt, setSafeWalletUpdatedAt] = useState<string | null>(null)
    const [tempSafeWallet, setTempSafeWallet] = useState("")
    const [safeWalletLoading, setSafeWalletLoading] = useState(false)
    const [safeWalletError, setSafeWalletError] = useState<string | null>(null)
    const [changingWallet, setChangingWallet] = useState(false)
    const [loading, setLoading] = useState(true)

    const [userProfile, setUserProfile] = useState<{ displayName: string, handle: string, avatarUrl: string | null }>({
        displayName: "Loading...",
        handle: "...",
        avatarUrl: null
    })

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/')
                return
            }

            // User metadata from OAuth
            const metadata = user.user_metadata
            const displayName = metadata.full_name || metadata.name || metadata.preferred_username || metadata.user_name || "Whitehat Agent"
            let handle = metadata.preferred_username || metadata.user_name || metadata.name || user.email?.split('@')[0] || "operator"
            if (!handle.startsWith('@')) handle = `@${handle}`
            const avatar = metadata.avatar_url || metadata.picture || metadata.image || null
            setUserProfile({ displayName, handle, avatarUrl: avatar })

            // Fetch profile from DB (safe wallet)
            const res = await fetch('/api/profile')
            if (res.ok) {
                const profile = await res.json()
                if (profile.safe_wallet_address) {
                    setSafeWallet(profile.safe_wallet_address)
                }
                if (profile.updated_at) {
                    setSafeWalletUpdatedAt(profile.updated_at)
                }
            }

            // Fetch wallet submissions
            const walletsRes = await fetch('/api/wallets')
            if (walletsRes.ok) {
                const walletsData = await walletsRes.json()
                setWallets(walletsData)
            }

            setLoading(false)
        }
        init()
    }, [supabase, router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/")
    }

    const [wallets, setWallets] = useState<WalletSubmission[]>([])
    const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)
    const [newPrivateKey, setNewPrivateKey] = useState("")
    const [submitLoading, setSubmitLoading] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const isValidEthAddress = (addr: string) => ETH_ADDRESS_REGEX.test(addr)

    // Derive address from private key in real-time
    const derivedAddress = useMemo(() => {
        if (!newPrivateKey) return null
        try {
            const normalized = newPrivateKey.startsWith('0x') ? newPrivateKey : `0x${newPrivateKey}`
            const wallet = new ethers.Wallet(normalized)
            return wallet.address
        } catch {
            return null
        }
    }, [newPrivateKey])

    // Fetch wallets from DB
    const fetchWallets = async () => {
        const res = await fetch('/api/wallets')
        if (res.ok) {
            const data = await res.json()
            setWallets(data)
        }
    }

    const handleSubmitPrivateKey = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)

        if (!derivedAddress) {
            setSubmitError('Invalid private key.')
            return
        }

        setSubmitLoading(true)
        const res = await fetch('/api/wallets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ private_key: newPrivateKey }),
        })

        if (res.ok) {
            setNewPrivateKey("")
            await fetchWallets()
        } else {
            const data = await res.json()
            setSubmitError(data.error)
        }
        setSubmitLoading(false)
    }

    const handleSaveSafeWallet = async (e: React.FormEvent) => {
        e.preventDefault()
        setSafeWalletError(null)

        if (!isValidEthAddress(tempSafeWallet)) {
            setSafeWalletError('Invalid Ethereum address. Must start with 0x followed by 40 hex characters.')
            return
        }

        setSafeWalletLoading(true)
        const res = await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ safe_wallet_address: tempSafeWallet }),
        })

        if (res.ok) {
            const data = await res.json()
            setSafeWallet(data.safe_wallet_address)
            setSafeWalletUpdatedAt(data.updated_at)
            setTempSafeWallet("")
            setChangingWallet(false)
        } else {
            const data = await res.json()
            setSafeWalletError(data.error)
        }
        setSafeWalletLoading(false)
    }

    if (loading) {
        return (
            <main className="min-h-screen w-full bg-[#050505] text-[#e5e5e5] font-mono flex items-center justify-center">
                <div className="text-[#555] text-[10px] uppercase tracking-[0.3em] animate-pulse">Loading System...</div>
            </main>
        )
    }

    return (
        <main className="min-h-screen w-full bg-[#050505] text-[#e5e5e5] font-mono selection:bg-white selection:text-black relative flex flex-col">

            {/* --- BACKGROUND FX --- */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            {/* --- HEADER --- */}
            <header className="relative z-20 w-full px-6 py-5 md:px-8 border-b border-[#1a1a1a] bg-[#050505]/80 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center gap-4 text-[10px] md:text-xs tracking-[0.3em] text-[#555] uppercase">
                    <Link href="/" className="flex items-center gap-4 hover:text-white transition-colors cursor-pointer group">
                        <span className="w-6 md:w-8 h-[1px] bg-[#333] group-hover:bg-white transition-colors"></span>
                        <span className="text-white font-bold">WHITEHAT // OPS</span>
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-3 border-r border-[#222] pr-6">
                        <div className="w-8 h-8 bg-[#111] rounded-full border border-[#222] flex items-center justify-center overflow-hidden relative">
                            {userProfile.avatarUrl ? (
                                <Image
                                    src={userProfile.avatarUrl}
                                    alt={userProfile.displayName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-[#222] to-[#444]"></div>
                            )}
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] font-bold text-white tracking-widest uppercase">{userProfile.displayName}</span>
                            <span className="text-[9px] text-[#444] tracking-widest uppercase">{userProfile.handle.toLowerCase()}</span>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="text-[10px] uppercase tracking-[0.2em] text-[#666] hover:text-red-500 border border-[#222] hover:border-red-900 px-4 py-2 transition-all">
                        [ Logout ]
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <div className="relative z-10 max-w-4xl mx-auto w-full p-6 md:p-12 grid gap-12">

                {/* STEP 01: SECURE DESTINATION */}
                <section className={`${!safeWallet ? 'opacity-100' : 'opacity-80 hover:opacity-100 transition-opacity'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold tracking-[0.2em] text-[#666] uppercase flex items-center gap-2">
                            <span className="text-white">01</span> {"//"} Secure Destination
                        </h2>
                        {safeWallet && (
                            <div className="text-[9px] text-[#444] border border-[#222] px-2 py-1 uppercase tracking-wider bg-[#111]">
                                Active Route
                            </div>
                        )}
                    </div>

                    {!safeWallet ? (
                        <div className="bg-[#080808] border border-[#333] p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <p className="text-sm text-[#ccc] mb-4 max-w-xl leading-relaxed">
                                <strong className="text-white">CRITICAL FIRST STEP:</strong> Enter a safe, uncompromised wallet address.
                                This is where all rescued assets will be automatically diverted.
                            </p>

                            {/* Warning Notice */}
                            <div className="bg-yellow-500/5 border border-yellow-900/30 p-4 mb-6 flex gap-3">
                                <div className="text-yellow-600 shrink-0"><IconAlert /></div>
                                <div className="text-[10px] text-[#999] leading-relaxed space-y-2">
                                    <p>
                                        This will be the <strong className="text-yellow-600">permanent destination</strong> for all rescued funds. You can only change this address once every <strong className="text-white">3 days</strong>. For urgent changes, contact <a href="https://x.com/codeesura" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">@codeesura</a> or <a href="mailto:contact@codeesura.dev" className="text-white hover:underline">contact@codeesura.dev</a>.
                                    </p>
                                    <p className="text-red-500">
                                        <strong>DO NOT enter a CEX (exchange) address.</strong> Rescued funds sent to exchange deposit addresses (Binance, Coinbase, etc.) may be permanently lost. Only use a self-custody wallet (MetaMask, Ledger, Rabby, etc.).
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveSafeWallet} className="flex flex-col gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="0x... (Safe Receiver Address)"
                                        value={tempSafeWallet}
                                        onChange={(e) => { setTempSafeWallet(e.target.value); setSafeWalletError(null) }}
                                        className={`w-full h-14 bg-[#050505] border ${safeWalletError ? 'border-red-900/50' : 'border-[#222] focus:border-white'} px-4 text-white font-mono placeholder-[#333] outline-none transition-colors`}
                                    />
                                    {/* Realtime validation hint */}
                                    {tempSafeWallet && !isValidEthAddress(tempSafeWallet) && (
                                        <p className="text-[9px] text-[#555] mt-2 tracking-wider">
                                            Format: 0x followed by 40 hex characters (a-f, 0-9)
                                        </p>
                                    )}
                                    {safeWalletError && (
                                        <p className="text-[10px] text-red-500 mt-2">{safeWalletError}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={!isValidEthAddress(tempSafeWallet) || safeWalletLoading}
                                    className="h-12 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#ddd] disabled:bg-[#222] disabled:text-[#444] disabled:cursor-not-allowed transition-all w-full md:w-auto md:self-start md:px-8 cursor-pointer"
                                >
                                    {safeWalletLoading ? 'Saving...' : 'Confirm Destination'}
                                </button>
                            </form>
                        </div>
                    ) : changingWallet ? (
                        /* Change wallet form (reuses same form) */
                        <div className="bg-[#080808] border border-[#333] p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <p className="text-sm text-[#ccc] mb-4 max-w-xl leading-relaxed">
                                <strong className="text-white">CHANGE DESTINATION:</strong> Enter your new safe wallet address.
                            </p>

                            <div className="bg-red-500/5 border border-red-900/30 p-4 mb-6 flex gap-3">
                                <div className="text-red-500 shrink-0"><IconAlert /></div>
                                <p className="text-[10px] text-[#999] leading-relaxed">
                                    <strong className="text-red-500">DO NOT</strong> enter a CEX (exchange) address. Funds sent to exchange deposit addresses may be <strong className="text-white">permanently lost</strong>. Only use a wallet you fully control (MetaMask, Ledger, etc.).
                                </p>
                            </div>

                            <form onSubmit={handleSaveSafeWallet} className="flex flex-col gap-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="0x... (New Safe Receiver Address)"
                                        value={tempSafeWallet}
                                        onChange={(e) => { setTempSafeWallet(e.target.value); setSafeWalletError(null) }}
                                        className={`w-full h-14 bg-[#050505] border ${safeWalletError ? 'border-red-900/50' : 'border-[#222] focus:border-white'} px-4 text-white font-mono placeholder-[#333] outline-none transition-colors`}
                                    />
                                    {tempSafeWallet && !isValidEthAddress(tempSafeWallet) && (
                                        <p className="text-[9px] text-[#555] mt-2 tracking-wider">
                                            Format: 0x followed by 40 hex characters (a-f, 0-9)
                                        </p>
                                    )}
                                    {safeWalletError && (
                                        <p className="text-[10px] text-red-500 mt-2">{safeWalletError}</p>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setChangingWallet(false); setTempSafeWallet(""); setSafeWalletError(null) }}
                                        className="h-12 px-6 border border-[#222] text-[10px] text-[#666] hover:text-white hover:border-[#444] uppercase tracking-[0.2em] transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!isValidEthAddress(tempSafeWallet) || safeWalletLoading}
                                        className="h-12 px-8 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#ddd] disabled:bg-[#222] disabled:text-[#444] disabled:cursor-not-allowed transition-all cursor-pointer"
                                    >
                                        {safeWalletLoading ? 'Saving...' : 'Confirm New Address'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Saved wallet display */
                        <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="pl-2 border-l-2 border-emerald-500/50">
                                        <div className="text-[9px] text-[#444] uppercase tracking-widest mb-1">Destination Secured</div>
                                        <div className="text-white font-mono text-lg md:text-xl tracking-tight">{safeWallet}</div>
                                    </div>
                                </div>
                                {(() => {
                                    const canChange = !safeWalletUpdatedAt || (Date.now() - new Date(safeWalletUpdatedAt).getTime()) > 3 * 24 * 60 * 60 * 1000
                                    const remainingMs = safeWalletUpdatedAt ? (3 * 24 * 60 * 60 * 1000) - (Date.now() - new Date(safeWalletUpdatedAt).getTime()) : 0
                                    const remainingHours = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60)))

                                    return (
                                        <button
                                            onClick={() => canChange && setChangingWallet(true)}
                                            disabled={!canChange}
                                            className={`text-[9px] uppercase tracking-widest transition-all px-4 py-2 border cursor-pointer ${canChange
                                                ? 'text-[#444] hover:text-white border-[#222] hover:border-[#444]'
                                                : 'text-[#333] border-[#1a1a1a] cursor-not-allowed'
                                                }`}
                                            title={!canChange ? `Available in ${remainingHours}h` : undefined}
                                        >
                                            {canChange ? 'Change' : `Locked (${remainingHours}h)`}
                                        </button>
                                    )
                                })()}
                            </div>

                            {/* Info bar */}
                            <div className="border-t border-[#1a1a1a] px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <p className="text-[9px] text-[#444] leading-relaxed">
                                    Address changes are limited to once every 3 days. For urgent requests, contact us.
                                </p>
                                <div className="flex items-center gap-4 shrink-0">
                                    <a href="https://x.com/codeesura" target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#555] hover:text-white uppercase tracking-widest transition-colors">@codeesura</a>
                                    <span className="text-[#222]">|</span>
                                    <a href="mailto:contact@codeesura.dev" className="text-[9px] text-[#555] hover:text-white uppercase tracking-widest transition-colors">contact@codeesura.dev</a>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* STEP 02: SUBMIT PRIVATE KEY */}
                <section className={`transition-all duration-500 ${!safeWallet ? 'opacity-30 pointer-events-none blur-[2px]' : 'opacity-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold tracking-[0.2em] text-[#666] uppercase flex items-center gap-2">
                            <span className="text-white">02</span> {"//"} Submit Compromised Wallet
                        </h2>
                    </div>

                    <div className="bg-[#0a0a0a] border-t border-[#1a1a1a]">
                        <div className="bg-[#111]/30 p-4 border-b border-[#1a1a1a] flex gap-3">
                            <div className="text-[#555] pt-0.5 shrink-0"><IconShield /></div>
                            <p className="text-[10px] text-[#666] leading-relaxed max-w-2xl">
                                Enter the private key of your compromised wallet. The wallet address will be <strong className="text-white">automatically derived</strong> from the key. Your private key is encrypted with RSA-2048 before storage — only the rescue operator can decrypt it.
                            </p>
                        </div>

                        <form onSubmit={handleSubmitPrivateKey} className="p-6 md:p-8 space-y-4">
                            <div>
                                <div className={`border ${derivedAddress ? 'border-emerald-900/50' : newPrivateKey ? 'border-red-900/50' : 'border-[#333]'} focus-within:border-[#555] transition-colors bg-[#080808] relative`}>
                                    <input
                                        type="password"
                                        autoComplete="off"
                                        spellCheck={false}
                                        placeholder="Private key (0x... or raw hex)"
                                        value={newPrivateKey}
                                        onChange={(e) => { setNewPrivateKey(e.target.value); setSubmitError(null) }}
                                        className="w-full h-14 bg-transparent px-4 pr-28 text-sm text-white placeholder-[#333] focus:outline-none font-mono"
                                    />
                                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest border px-2 py-1 ${derivedAddress ? 'text-emerald-500 border-emerald-900/50' : 'text-[#333] border-[#222]'}`}>
                                        {derivedAddress ? 'VALID' : 'RSA ENCRYPTED'}
                                    </div>
                                </div>

                                {/* Derived address preview */}
                                {derivedAddress && (
                                    <div className="mt-3 bg-[#080808] border border-emerald-900/30 p-4 flex items-center gap-3">
                                        <div className="pl-2 border-l-2 border-emerald-500/50">
                                            <div className="text-[9px] text-[#444] uppercase tracking-widest mb-1">Derived Wallet Address</div>
                                            <div className="text-emerald-400 font-mono text-sm">{derivedAddress}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Invalid key hint */}
                                {newPrivateKey && !derivedAddress && (
                                    <p className="text-[9px] text-[#555] mt-2 tracking-wider">
                                        Enter a valid EVM private key (64 hex characters). Mnemonic phrases are not accepted.
                                    </p>
                                )}

                                {submitError && (
                                    <p className="text-[10px] text-red-500 mt-2">{submitError}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={!derivedAddress || submitLoading}
                                className="h-12 px-8 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#ccc] disabled:bg-[#111] disabled:text-[#333] disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                {submitLoading ? 'Encrypting & Saving...' : 'Submit Wallet'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* STEP 03: SUBMISSIONS LIST */}
                {wallets.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-bold tracking-[0.2em] text-[#666] uppercase flex items-center gap-2">
                                <span className="text-white">03</span> {"//"} Your Submissions
                            </h2>
                            <div className="text-[9px] text-[#444] border border-[#222] px-2 py-1 uppercase tracking-wider bg-[#111]">
                                {wallets.length} Total
                            </div>
                        </div>

                        <div className="bg-[#0a0a0a] border border-[#1a1a1a] divide-y divide-[#1a1a1a]">
                            {wallets.map((w, i) => {
                                const statusColors: Record<string, string> = {
                                    pending: 'text-yellow-500',
                                    eml_required: 'text-orange-400',
                                    verified: 'text-emerald-400',
                                    in_progress: 'text-purple-400',
                                    completed: 'text-emerald-300',
                                    rejected: 'text-red-500',
                                }
                                const statusLabels: Record<string, string> = {
                                    pending: 'PENDING VERIFICATION',
                                    eml_required: 'EML REQUIRED',
                                    verified: 'VERIFIED',
                                    in_progress: 'RESCUE IN PROGRESS',
                                    completed: 'COMPLETED',
                                    rejected: 'REJECTED',
                                }
                                const isPending = w.status === 'pending' || w.status === 'eml_required'
                                return (
                                    <div
                                        key={w.id}
                                        className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#0c0c0c] transition-colors ${isPending ? 'cursor-pointer' : ''}`}
                                        onClick={() => isPending && setSelectedWalletId(w.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-[#333] text-[10px] font-bold w-6">{String(wallets.length - i).padStart(2, '0')}</div>
                                            <div>
                                                <div className="text-sm text-white font-mono">{w.compromised_address}</div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-[9px] uppercase tracking-widest ${statusColors[w.status] ?? 'text-[#444]'}`}>
                                                        {statusLabels[w.status] ?? w.status}
                                                    </span>
                                                    {w.funding_cex_name && (
                                                        <span className="text-[9px] text-[#555] uppercase tracking-widest">
                                                            via {w.funding_cex_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-[9px] text-[#333] text-right">
                                                {new Date(w.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                {' '}
                                                {new Date(w.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {isPending && (
                                                <span className="text-[#444] group-hover:text-white transition-colors">&#x2192;</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* OWNERSHIP VERIFICATION MODAL */}
                {selectedWalletId && (() => {
                    const w = wallets.find(w => w.id === selectedWalletId)
                    if (!w) return null
                    return (
                        <OwnershipVerificationModal
                            wallet={w}
                            onClose={() => setSelectedWalletId(null)}
                            onUpdate={fetchWallets}
                        />
                    )
                })()}

            </div>
        </main>
    )
}

// --- OWNERSHIP VERIFICATION MODAL ---
function OwnershipVerificationModal({ wallet, onClose, onUpdate }: {
    wallet: WalletSubmission
    onClose: () => void
    onUpdate: () => Promise<void>
}) {
    const [emlFile, setEmlFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [emlError, setEmlError] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)

    const hasFunding = !!wallet.funding_tx_hash
    const hasCex = !!wallet.funding_cex_name
    const needsEml = wallet.status === 'eml_required'

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file?.name.endsWith('.eml')) {
            setEmlFile(file)
            setEmlError(null)
        } else {
            setEmlError('Only .eml files are accepted')
        }
    }

    const handleFileSelect = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.eml'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                setEmlFile(file)
                setEmlError(null)
            }
        }
        input.click()
    }

    const handleUpload = async () => {
        if (!emlFile) return
        setUploading(true)
        setEmlError(null)

        const formData = new FormData()
        formData.append('eml', emlFile)

        try {
            const res = await fetch(`/api/wallets/${wallet.id}/upload-eml`, {
                method: 'POST',
                body: formData,
            })
            const data = await res.json()

            if (!res.ok) {
                setEmlError(data.error || 'Upload failed')
            } else {
                await onUpdate()
                onClose()
            }
        } catch {
            setEmlError('Network error. Please try again.')
        }
        setUploading(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#0a0a0a] border border-[#222] w-full max-w-2xl overflow-hidden shadow-2xl shadow-black max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="bg-[#0f0f0f] border-b border-[#222] p-6 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-[0.2em] uppercase flex items-center gap-2">
                            <IconShield />
                            Ownership Verification
                        </h3>
                        <p className="text-[10px] text-[#555] uppercase mt-1 tracking-wider font-mono">{wallet.compromised_address}</p>
                    </div>
                    <button onClick={onClose} className="text-[#444] hover:text-white transition-colors text-xl leading-none cursor-pointer">&times;</button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 space-y-6">

                    {/* Funding not yet found */}
                    {!hasFunding && (
                        <div className="text-center space-y-3 py-6">
                            <div className="inline-block w-5 h-5 border-2 border-[#333] border-t-white rounded-full animate-spin" />
                            <p className="text-[10px] text-[#555] uppercase tracking-widest">Scanning Blockchain...</p>
                            <p className="text-[9px] text-[#444] max-w-sm mx-auto leading-relaxed">
                                Checking the first funding transaction across all supported EVM chains.
                                Refresh the page if this takes too long.
                            </p>
                        </div>
                    )}

                    {/* Funding found */}
                    {hasFunding && (
                        <div className="space-y-4">
                            <h4 className="text-white text-[10px] font-bold uppercase tracking-widest border-b border-[#1a1a1a] pb-2">
                                First Funding Transaction
                            </h4>

                            <div className="bg-[#080808] border border-[#1a1a1a] p-5">
                                <div className="grid grid-cols-1 gap-3">
                                    <div>
                                        <div className="text-[9px] text-[#444] uppercase tracking-widest mb-1">TX Hash</div>
                                        <div className="text-[11px] text-blue-400 font-mono break-all">{wallet.funding_tx_hash}</div>
                                    </div>
                                    {hasCex && (
                                        <div>
                                            <div className="text-[9px] text-[#444] uppercase tracking-widest mb-1">Source</div>
                                            <div className="text-[11px] text-orange-400 font-bold">{wallet.funding_cex_name}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* No CEX → contact required */}
                            {!hasCex && (
                                <div className="bg-yellow-500/5 border border-yellow-900/30 p-4 space-y-3">
                                    <div className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest">
                                        Unknown Funding Source
                                    </div>
                                    <p className="text-[11px] text-[#777] leading-relaxed">
                                        The funding source of this wallet could not be matched to a known exchange.
                                        To verify ownership, please contact us directly with additional proof
                                        (transaction screenshot, wallet history, or any other evidence).
                                    </p>
                                    <div className="flex items-center gap-4 pt-1">
                                        <a href="https://x.com/codeesura" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#555] hover:text-white uppercase tracking-widest transition-colors">@codeesura</a>
                                        <span className="text-[#222]">|</span>
                                        <a href="mailto:contact@codeesura.dev" className="text-[10px] text-[#555] hover:text-white uppercase tracking-widest transition-colors">contact@codeesura.dev</a>
                                    </div>
                                </div>
                            )}

                            {/* CEX detected → .eml upload */}
                            {hasCex && needsEml && (
                                <div className="space-y-4">
                                    <div className="bg-orange-500/5 border border-orange-900/30 p-4 space-y-2">
                                        <div className="text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                                            CEX Detected — Email Verification Required
                                        </div>
                                        <p className="text-[11px] text-[#777] leading-relaxed">
                                            This wallet was funded from <strong className="text-orange-400">{wallet.funding_cex_name}</strong>.
                                            Upload the withdrawal confirmation email (.eml format) to verify ownership. The DKIM signature will be cryptographically verified.
                                        </p>
                                    </div>

                                    {/* Drop zone */}
                                    <div
                                        className={`border-2 border-dashed ${dragOver ? 'border-white bg-[#111]' : emlFile ? 'border-emerald-900/50 bg-emerald-500/5' : 'border-[#333] hover:border-[#555]'} p-8 text-center transition-all cursor-pointer`}
                                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleDrop}
                                        onClick={handleFileSelect}
                                    >
                                        {emlFile ? (
                                            <div className="space-y-1">
                                                <div className="text-emerald-400 text-xs font-mono">{emlFile.name}</div>
                                                <div className="text-[9px] text-[#444]">{(emlFile.size / 1024).toFixed(1)} KB</div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="text-[10px] text-[#666] uppercase tracking-widest">Drag & Drop .eml file</div>
                                                <div className="text-[9px] text-[#444]">or click to browse</div>
                                            </div>
                                        )}
                                    </div>

                                    {emlError && (
                                        <p className="text-[10px] text-red-500">{emlError}</p>
                                    )}

                                    {emlFile && (
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="w-full h-12 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[#ccc] disabled:bg-[#222] disabled:text-[#444] disabled:cursor-not-allowed transition-all cursor-pointer"
                                        >
                                            {uploading ? 'Verifying DKIM & Encrypting...' : 'Verify & Submit'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Already verified */}
                            {wallet.eml_verified && (
                                <div className="bg-emerald-500/5 border border-emerald-900/30 p-4 space-y-2">
                                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                        Email Verified (DKIM Pass)
                                    </div>
                                    <p className="text-[11px] text-[#777]">
                                        Ownership confirmed. Your rescue request is being processed.
                                    </p>
                                </div>
                            )}

                            {/* Rejected */}
                            {wallet.status === 'rejected' && (
                                <div className="bg-red-500/5 border border-red-900/30 p-4 space-y-2">
                                    <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                                        Verification Failed
                                    </div>
                                    <p className="text-[11px] text-[#777]">
                                        DKIM signature could not be verified. Please contact us for manual review.
                                    </p>
                                    <div className="flex items-center gap-4 pt-2">
                                        <a href="https://x.com/codeesura" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#555] hover:text-white uppercase tracking-widest transition-colors">@codeesura</a>
                                        <span className="text-[#222]">|</span>
                                        <a href="mailto:contact@codeesura.dev" className="text-[10px] text-[#555] hover:text-white uppercase tracking-widest transition-colors">contact@codeesura.dev</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end pt-4 border-t border-[#1a1a1a]">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 border border-[#222] text-[10px] text-[#666] hover:text-white hover:border-[#444] uppercase tracking-widest transition-all cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}