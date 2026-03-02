"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ethers } from "ethers"

// --- ICONS ---
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

            // Fetch profile + wallets in parallel
            const [profileRes, walletsRes] = await Promise.all([
                fetch('/api/profile'),
                fetch('/api/wallets'),
            ])

            if (profileRes.ok) {
                const profile = await profileRes.json()
                if (profile.safe_wallet_address) setSafeWallet(profile.safe_wallet_address)
                if (profile.updated_at) setSafeWalletUpdatedAt(profile.updated_at)
            }

            if (walletsRes.ok) {
                setWallets(await walletsRes.json())
            }

            setLoading(false)
        }
        init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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

    return (
        <main className="min-h-screen w-full bg-[#050505] text-[#e5e5e5] font-mono selection:bg-white selection:text-black relative flex flex-col">

            {/* --- BACKGROUND FX --- */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.7%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E')]"></div>
            <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-6 h-6 border-2 border-[#222] border-t-white rounded-full animate-spin" />
                        <div className="text-[#999] text-[10px] uppercase tracking-[0.3em]">Initializing Secure Session...</div>
                    </div>
                </div>
            ) : (<>

            {/* --- HEADER --- */}
            <header className="relative z-20 w-full px-6 py-5 md:px-8 border-b border-[#1a1a1a] bg-[#050505]/80 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center gap-4 text-[10px] md:text-xs tracking-[0.3em] text-[#999] uppercase">
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
                            <span className="text-[9px] text-[#aaa] tracking-widest uppercase">{userProfile.handle.toLowerCase()}</span>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="text-[10px] uppercase tracking-[0.2em] text-[#999] hover:text-red-500 border border-[#222] hover:border-red-900 px-4 py-2 transition-all">
                        [ Logout ]
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <div className="relative z-10 max-w-4xl mx-auto w-full p-6 md:p-12 grid gap-12">

                {/* STEP 01: SECURE DESTINATION */}
                <section className={`${!safeWallet ? 'opacity-100' : 'opacity-80 hover:opacity-100 transition-opacity'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold tracking-[0.2em] text-[#999] uppercase flex items-center gap-2">
                            <span className="text-white">01</span> {"//"} Secure Destination
                        </h2>
                        {safeWallet && (
                            <div className="text-[9px] text-[#aaa] border border-[#222] px-2 py-1 uppercase tracking-wider bg-[#111]">
                                Active Route
                            </div>
                        )}
                    </div>

                    {!safeWallet ? (
                        <div className="bg-[#080808] border border-[#333] p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <p className="text-sm text-[#ccc] mb-4 max-w-xl leading-relaxed">
                                <strong className="text-white">SET RESCUE DESTINATION:</strong> All recovered assets will be sent to this address. Make sure it is a wallet you fully control.
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
                                        className={`w-full h-14 bg-[#050505] border ${safeWalletError ? 'border-red-900/50' : 'border-[#222] focus:border-white'} px-4 text-white font-mono placeholder-[#666] outline-none transition-colors`}
                                    />
                                    {/* Realtime validation hint */}
                                    {tempSafeWallet && !isValidEthAddress(tempSafeWallet) && (
                                        <p className="text-[9px] text-[#999] mt-2 tracking-wider">
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
                                    className="h-12 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#ddd] disabled:bg-[#222] disabled:text-[#aaa] disabled:cursor-not-allowed transition-all w-full md:w-auto md:self-start md:px-8 cursor-pointer"
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
                                        className={`w-full h-14 bg-[#050505] border ${safeWalletError ? 'border-red-900/50' : 'border-[#222] focus:border-white'} px-4 text-white font-mono placeholder-[#666] outline-none transition-colors`}
                                    />
                                    {tempSafeWallet && !isValidEthAddress(tempSafeWallet) && (
                                        <p className="text-[9px] text-[#999] mt-2 tracking-wider">
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
                                        className="h-12 px-6 border border-[#222] text-[10px] text-[#999] hover:text-white hover:border-[#444] uppercase tracking-[0.2em] transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!isValidEthAddress(tempSafeWallet) || safeWalletLoading}
                                        className="h-12 px-8 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#ddd] disabled:bg-[#222] disabled:text-[#aaa] disabled:cursor-not-allowed transition-all cursor-pointer"
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
                                        <div className="text-[9px] text-[#aaa] uppercase tracking-widest mb-1">Destination Secured</div>
                                        <div className="text-white font-mono text-sm md:text-xl tracking-tight break-all">{safeWallet}</div>
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
                                                ? 'text-[#aaa] hover:text-white border-[#222] hover:border-[#444]'
                                                : 'text-[#999] border-[#1a1a1a] cursor-not-allowed'
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
                                <p className="text-[9px] text-[#aaa] leading-relaxed">
                                    Address changes are limited to once every 3 days. For urgent requests, contact me.
                                </p>
                                <div className="flex items-center gap-4 shrink-0">
                                    <a href="https://x.com/codeesura" target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#999] hover:text-white uppercase tracking-widest transition-colors">@codeesura</a>
                                    <span className="text-[#222]">|</span>
                                    <a href="mailto:contact@codeesura.dev" className="text-[9px] text-[#999] hover:text-white uppercase tracking-widest transition-colors">contact@codeesura.dev</a>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* STEP 02: SUBMIT PRIVATE KEY */}
                <section className={`transition-all duration-500 ${!safeWallet ? 'opacity-30 pointer-events-none blur-[2px]' : 'opacity-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold tracking-[0.2em] text-[#999] uppercase flex items-center gap-2">
                            <span className="text-white">02</span> {"//"} Submit Compromised Wallet
                        </h2>
                    </div>

                    <div className="bg-[#0a0a0a] border-t border-[#1a1a1a]">
                        <div className="bg-[#111]/30 p-4 border-b border-[#1a1a1a]">
                            <p className="text-[10px] text-[#999] leading-relaxed max-w-2xl">
                                Enter the private key of your compromised wallet. Your wallet address will be <strong className="text-white">automatically detected</strong>. The key is <strong className="text-white">encrypted</strong> before storage and can only be accessed by me for rescue operations.
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
                                        className="w-full h-14 bg-transparent px-4 pr-28 text-sm text-white placeholder-[#666] focus:outline-none font-mono"
                                    />
                                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest border px-2 py-1 ${derivedAddress ? 'text-emerald-500 border-emerald-900/50' : 'text-[#999] border-[#222]'}`}>
                                        {derivedAddress ? 'VALID' : 'ENCRYPTED'}
                                    </div>
                                </div>

                                {/* Derived address preview */}
                                {derivedAddress && (
                                    <div className="mt-3 bg-[#080808] border border-emerald-900/30 p-4 flex items-center gap-3">
                                        <div className="pl-2 border-l-2 border-emerald-500/50">
                                            <div className="text-[9px] text-[#aaa] uppercase tracking-widest mb-1">Derived Wallet Address</div>
                                            <div className="text-emerald-400 font-mono text-sm">{derivedAddress}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Invalid key hint */}
                                {newPrivateKey && !derivedAddress && (
                                    <p className="text-[9px] text-[#999] mt-2 tracking-wider">
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
                                className="h-12 px-8 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#ccc] disabled:bg-[#111] disabled:text-[#999] disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                {submitLoading ? 'Encrypting & Verifying...' : 'Submit for Rescue'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* STEP 03: SUBMISSIONS LIST */}
                {wallets.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-bold tracking-[0.2em] text-[#999] uppercase flex items-center gap-2">
                                <span className="text-white">03</span> {"//"} Your Submissions
                            </h2>
                            <div className="flex items-center gap-3">
                                {wallets.filter(w => w.status === 'verified').length > 0 && (
                                    <span className="text-[9px] text-emerald-500 border border-emerald-900/50 px-2 py-1 uppercase tracking-wider bg-emerald-500/5">
                                        {wallets.filter(w => w.status === 'verified').length} Verified
                                    </span>
                                )}
                                {wallets.filter(w => w.status === 'eml_required').length > 0 && (
                                    <span className="text-[9px] text-orange-400 border border-orange-900/50 px-2 py-1 uppercase tracking-wider bg-orange-500/5">
                                        {wallets.filter(w => w.status === 'eml_required').length} EML Required
                                    </span>
                                )}
                                {wallets.filter(w => w.status === 'pending').length > 0 && (
                                    <span className="text-[9px] text-yellow-500 border border-yellow-900/50 px-2 py-1 uppercase tracking-wider bg-yellow-500/5">
                                        {wallets.filter(w => w.status === 'pending').length} Pending
                                    </span>
                                )}
                                <span className="text-[9px] text-[#aaa] border border-[#222] px-2 py-1 uppercase tracking-wider bg-[#111]">
                                    {wallets.length} Total
                                </span>
                            </div>
                        </div>

                        <div className="bg-[#0a0a0a] border border-[#1a1a1a] divide-y divide-[#1a1a1a] max-h-[400px] overflow-y-auto">
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
                                const isClickable = ['pending', 'eml_required', 'verified', 'rejected'].includes(w.status)
                                return (
                                    <div
                                        key={w.id}
                                        className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#0c0c0c] transition-colors ${isClickable ? 'cursor-pointer' : ''}`}
                                        onClick={() => isClickable && setSelectedWalletId(w.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-[#999] text-[10px] font-bold w-6">{String(wallets.length - i).padStart(2, '0')}</div>
                                            <div>
                                                <div className="text-sm text-white font-mono truncate max-w-[200px] md:max-w-none">{w.compromised_address}</div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-[9px] uppercase tracking-widest ${statusColors[w.status] ?? 'text-[#aaa]'}`}>
                                                        {statusLabels[w.status] ?? w.status}
                                                    </span>
                                                    {w.funding_cex_name && (
                                                        <span className="text-[9px] text-[#999] uppercase tracking-widest">
                                                            via {w.funding_cex_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-[9px] text-[#999] text-right">
                                                {new Date(w.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                {' '}
                                                {new Date(w.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {isClickable && (
                                                <span className="text-[#aaa] group-hover:text-white transition-colors">&#x2192;</span>
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

            </>)}
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
    const needsEml = wallet.status === 'eml_required' || wallet.status === 'rejected'

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
                        <h3 className="text-sm font-bold text-white tracking-[0.2em] uppercase">
                            Ownership Verification
                        </h3>
                        <p className="text-[10px] text-[#999] uppercase mt-1 tracking-wider font-mono">{wallet.compromised_address}</p>
                    </div>
                    <button onClick={onClose} className="text-[#aaa] hover:text-white transition-colors text-xl leading-none cursor-pointer">&times;</button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 space-y-6">

                    {/* Funding not yet found */}
                    {!hasFunding && (
                        <div className="bg-[#111]/50 border border-[#1a1a1a] p-6 space-y-3">
                            <div className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest">
                                Funding Data Unavailable
                            </div>
                            <p className="text-[11px] text-[#999] leading-relaxed">
                                The funding source of this wallet could not be automatically detected. This may happen with bridge transactions, contract deployments, or non-standard funding methods. Please contact me directly for manual verification.
                            </p>
                            <div className="flex items-center gap-4 pt-1">
                                <a href="https://x.com/codeesura" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#999] hover:text-white uppercase tracking-widest transition-colors">@codeesura</a>
                                <span className="text-[#222]">|</span>
                                <a href="mailto:contact@codeesura.dev" className="text-[10px] text-[#999] hover:text-white uppercase tracking-widest transition-colors">contact@codeesura.dev</a>
                            </div>
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
                                        <div className="text-[9px] text-[#aaa] uppercase tracking-widest mb-1">TX Hash</div>
                                        <div className="text-[11px] text-blue-400 font-mono break-all">{wallet.funding_tx_hash}</div>
                                    </div>
                                    {hasCex && (
                                        <div>
                                            <div className="text-[9px] text-[#aaa] uppercase tracking-widest mb-1">Source</div>
                                            <div className="text-[11px] text-orange-400 font-bold">{wallet.funding_cex_name}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* No CEX → contact required */}
                            {!hasCex && (
                                <div className="bg-yellow-500/5 border border-yellow-900/30 p-4 space-y-3">
                                    <div className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest">
                                        Manual Verification Required
                                    </div>
                                    <p className="text-[11px] text-[#999] leading-relaxed">
                                        This wallet was not funded from a recognized exchange. Automatic email verification is not available for this wallet.
                                        Please contact me with any proof of ownership (transaction history, signing a message, or other evidence) so I can proceed with your rescue request.
                                    </p>
                                    <div className="flex items-center gap-4 pt-1">
                                        <a href="https://x.com/codeesura" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#999] hover:text-white uppercase tracking-widest transition-colors">@codeesura</a>
                                        <span className="text-[#222]">|</span>
                                        <a href="mailto:contact@codeesura.dev" className="text-[10px] text-[#999] hover:text-white uppercase tracking-widest transition-colors">contact@codeesura.dev</a>
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
                                        <p className="text-[11px] text-[#999] leading-relaxed">
                                            This wallet was funded from <strong className="text-orange-400">{wallet.funding_cex_name}</strong>.
                                            Upload the original withdrawal confirmation email in <strong className="text-white">.eml format</strong>.
                                        </p>
                                    </div>

                                    {/* What we verify */}
                                    <div className="bg-[#080808] border border-[#1a1a1a] p-4">
                                        <div className="text-[10px] text-[#999] uppercase tracking-widest mb-3 font-bold">Verification Checks</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                                            <div className="flex items-center gap-2 text-[#999]">
                                                <span className="text-white">-</span> Email authenticity
                                            </div>
                                            <div className="flex items-center gap-2 text-[#999]">
                                                <span className="text-white">-</span> Sender matches {wallet.funding_cex_name}
                                            </div>
                                            <div className="flex items-center gap-2 text-[#999]">
                                                <span className="text-white">-</span> Your wallet address
                                            </div>
                                            <div className="flex items-center gap-2 text-[#999]">
                                                <span className="text-white">-</span> Transaction ID
                                            </div>
                                        </div>
                                    </div>

                                    {/* How to download .eml */}
                                    <details className="group">
                                        <summary className="text-[10px] text-[#999] hover:text-white uppercase tracking-widest cursor-pointer transition-colors flex items-center gap-2">
                                            <span className="text-[#aaa] group-open:rotate-90 transition-transform">&#x25B6;</span>
                                            How to download .eml file
                                        </summary>
                                        <div className="mt-3 bg-[#080808] border border-[#1a1a1a] p-5 space-y-4 text-[11px] leading-relaxed">

                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-white font-bold text-[10px] bg-[#1a1a1a] px-2 py-0.5 shrink-0">1</span>
                                                    <div className="text-[#999]">
                                                        Open your email inbox and find the <strong className="text-white">withdrawal confirmation email</strong> from {wallet.funding_cex_name} for this specific transaction.
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <span className="text-white font-bold text-[10px] bg-[#1a1a1a] px-2 py-0.5 shrink-0">2</span>
                                                    <div className="text-[#999]">
                                                        Download the email as <strong className="text-white">.eml</strong> file:
                                                        <div className="mt-2 space-y-1.5 pl-2 border-l border-[#1a1a1a]">
                                                            <div><strong className="text-[#999]">Gmail:</strong> Open email &rarr; <span className="text-white">&#x22EE;</span> (three dots, top right) &rarr; &quot;Download message&quot;</div>
                                                            <div><strong className="text-[#999]">Outlook:</strong> Open email &rarr; File &rarr; Save As &rarr; save as .eml</div>
                                                            <div><strong className="text-[#999]">Yahoo:</strong> Open email &rarr; <span className="text-white">&hellip;</span> (more) &rarr; &quot;Download message&quot;</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <span className="text-white font-bold text-[10px] bg-[#1a1a1a] px-2 py-0.5 shrink-0">3</span>
                                                    <div className="text-[#999]">
                                                        Upload the downloaded .eml file below. Our system will automatically verify it.
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-red-500/5 border border-red-900/30 p-3 text-[10px] text-[#999]">
                                                <strong className="text-red-500">Do not forward</strong> the email to yourself or anyone before downloading. Forwarding <strong className="text-white">breaks the DKIM signature</strong> and the file will be rejected. Always download the original email directly from your inbox.
                                            </div>
                                        </div>
                                    </details>

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
                                                <div className="text-[9px] text-[#aaa]">{(emlFile.size / 1024).toFixed(1)} KB</div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="text-[10px] text-[#999] uppercase tracking-widest">Drag & Drop .eml file</div>
                                                <div className="text-[9px] text-[#aaa]">or click to browse</div>
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
                                            className="w-full h-12 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-[#ccc] disabled:bg-[#222] disabled:text-[#aaa] disabled:cursor-not-allowed transition-all cursor-pointer"
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
                                        Ownership Verified
                                    </div>
                                    <p className="text-[11px] text-[#999]">
                                        DKIM signature verified successfully. Your wallet has been added to the rescue queue.
                                        Your wallet is in the rescue queue. I will execute the rescue strategy as soon as possible. No further action is needed from you.
                                    </p>
                                </div>
                            )}

                            {/* Rejected */}
                            {wallet.status === 'rejected' && (
                                <div className="bg-red-500/5 border border-red-900/30 p-4 space-y-2">
                                    <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                                        Verification Failed
                                    </div>
                                    <p className="text-[11px] text-[#999]">
                                        The uploaded email could not be verified. This may happen if the email was forwarded, modified, or not downloaded in the original .eml format. Please contact me for manual review.
                                    </p>
                                    <div className="flex items-center gap-4 pt-2">
                                        <a href="https://x.com/codeesura" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#999] hover:text-white uppercase tracking-widest transition-colors">@codeesura</a>
                                        <span className="text-[#222]">|</span>
                                        <a href="mailto:contact@codeesura.dev" className="text-[10px] text-[#999] hover:text-white uppercase tracking-widest transition-colors">contact@codeesura.dev</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end pt-4 border-t border-[#1a1a1a]">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 border border-[#222] text-[10px] text-[#999] hover:text-white hover:border-[#444] uppercase tracking-widest transition-all cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}