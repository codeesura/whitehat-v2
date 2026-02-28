"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

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

const IconTrash = () => (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
)

export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()

    // --- STATE MANAGEMENT ---
    const [safeWallet, setSafeWallet] = useState<string>("")
    const [tempSafeWallet, setTempSafeWallet] = useState("")

    const [userProfile, setUserProfile] = useState<{ displayName: string, handle: string, avatarUrl: string | null }>({
        displayName: "Loading...",
        handle: "...",
        avatarUrl: null
    })

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Extract metadata (supports Discord, Twitter, etc.)
                const metadata = user.user_metadata

                // Display Name (e.g. "Code Esura")
                const displayName = metadata.full_name || metadata.name || metadata.preferred_username || metadata.user_name || "Whitehat Agent"

                // Handle/Username (e.g. "codeesura")
                // Discord/Twitter usually provide 'preferred_username' or 'user_name'
                let handle = metadata.preferred_username || metadata.user_name || metadata.name || user.email?.split('@')[0] || "operator"

                // Add @ prefix if not present
                if (!handle.startsWith('@')) handle = `@${handle}`

                const avatar = metadata.avatar_url || metadata.picture || metadata.image || null

                setUserProfile({
                    displayName: displayName,
                    handle: handle,
                    avatarUrl: avatar
                })
            } else {
                // Redirect if not logged in (optional but good for security)
                router.push('/')
            }
        }
        getUser()
    }, [supabase, router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/")
    }

    const [wallets, setWallets] = useState<{ id: string, address: string, status: 'PENDING_VERIFICATION' | 'ANALYZING' | 'SECURED' }[]>([])
    const [newWallet, setNewWallet] = useState("")
    // Modal State
    const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)

    const handleSaveSafeWallet = (e: React.FormEvent) => {
        e.preventDefault()
        if (tempSafeWallet.length > 10) {
            setSafeWallet(tempSafeWallet)
            setTempSafeWallet("")
        }
    }

    const handleAddCompromisedWallet = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newWallet) return
        const newId = Math.random().toString(36).substr(2, 9)
        setWallets([{ id: newId, address: newWallet, status: 'PENDING_VERIFICATION' }, ...wallets])
        setNewWallet("")
        // Open verification modal immediately for better UX
        setSelectedWalletId(newId)
    }

    const handleRemoveWallet = (id: string, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent triggering the row click if any
        setWallets(wallets.filter(w => w.id !== id))
    }

    const activeWallet = wallets.find(w => w.id === selectedWalletId)

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
                            <p className="text-sm text-[#ccc] mb-6 max-w-xl leading-relaxed">
                                <strong className="text-white">CRITICAL FIRST STEP:</strong> Enter a safe, uncompromised wallet address.
                                This is where all rescued assets will be automatically diverted.
                                <span className="block mt-2 text-[#666] text-xs">* Ensure you have full custody of this address. Do not use an exchange address.</span>
                            </p>
                            <form onSubmit={handleSaveSafeWallet} className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="0x... (Safe Receiver Amount)"
                                    value={tempSafeWallet}
                                    onChange={(e) => setTempSafeWallet(e.target.value)}
                                    className="w-full h-14 bg-[#050505] border border-[#222] focus:border-white px-4 text-white font-mono placeholder-[#333] outline-none transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={tempSafeWallet.length < 10}
                                    className="h-12 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#ddd] disabled:bg-[#222] disabled:text-[#444] disabled:cursor-not-allowed transition-all w-full md:w-auto md:self-start md:px-8"
                                >
                                    Confirm Destination
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="group relative bg-[#0a0a0a] border border-[#1a1a1a] p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="pl-2 border-l-2 border-emerald-500/50">
                                    <div className="text-[9px] text-[#444] uppercase tracking-widest mb-1">Destination Secured</div>
                                    <div className="text-white font-mono text-lg md:text-xl tracking-tight">{safeWallet}</div>
                                </div>
                            </div>
                            <button onClick={() => setSafeWallet("")} className="text-[9px] text-[#444] hover:text-white underline decoration-[#333] hover:decoration-white underline-offset-4 uppercase tracking-widest transition-all">
                                Change
                            </button>
                        </div>
                    )}
                </section>

                {/* STEP 02: COMPROMISED WALLETS */}
                <section className={`transition-all duration-500 ${!safeWallet ? 'opacity-30 pointer-events-none blur-[2px]' : 'opacity-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold tracking-[0.2em] text-[#666] uppercase flex items-center gap-2">
                            <span className="text-white">02</span> {"//"} Add Compromised Assets
                        </h2>
                    </div>

                    <div className="bg-[#0a0a0a] border-t border-[#1a1a1a]">
                        <div className="bg-[#111]/30 p-4 border-b border-[#1a1a1a] flex gap-3">
                            <div className="text-[#555] pt-0.5">ℹ</div>
                            <p className="text-[10px] text-[#666] leading-relaxed max-w-2xl">
                                Add the wallet address that has been compromised. The system will enter a <strong>PENDING</strong> state until you verify ownership.
                            </p>
                        </div>

                        <div className="p-6 md:p-8">
                            <form onSubmit={handleAddCompromisedWallet} className="flex flex-col md:flex-row gap-0 border border-[#333] focus-within:border-white transition-colors bg-[#080808]">
                                <div className="flex-1 relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333] text-lg select-none">›</span>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        spellCheck="false"
                                        placeholder="Enter compromised wallet address (0x...)"
                                        value={newWallet}
                                        onChange={(e) => setNewWallet(e.target.value)}
                                        className="w-full h-14 bg-transparent pl-10 pr-4 text-sm text-white placeholder-[#333] focus:outline-none font-mono"
                                    />
                                </div>
                                <button type="submit" disabled={!newWallet} className="h-14 px-8 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#ccc] disabled:bg-[#111] disabled:text-[#333] disabled:cursor-not-allowed transition-all">
                                    Initialize
                                </button>
                            </form>
                        </div>

                        <div className="border-t border-[#1a1a1a]">
                            {wallets.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="text-[#333] text-[10px] uppercase tracking-widest">No Active Extractions</div>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#1a1a1a]">
                                    {wallets.map((w, i) => (
                                        <div key={w.id} className="group flex flex-col transition-colors">
                                            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#0c0c0c] transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-[#333] text-[10px] font-bold w-6">0{wallets.length - i}</div>
                                                    <div>
                                                        <div className="text-sm text-white font-mono">{w.address}</div>
                                                        <div className="text-[9px] text-[#444] uppercase tracking-widest mt-1 group-hover:text-[#666] transition-colors">
                                                            STATUS: {w.status.replace('_', ' ')}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => setSelectedWalletId(w.id)}
                                                        className={`px-4 py-2 border text-[10px] uppercase tracking-widest transition-all ${w.status === 'PENDING_VERIFICATION' ? 'border-yellow-900/50 text-yellow-600 hover:bg-yellow-900/10' : 'border-emerald-900/50 text-emerald-500 hover:bg-emerald-900/10'}`}
                                                    >
                                                        {w.status === 'PENDING_VERIFICATION' ? 'Verify Ownership' : 'Simulate Rescue'}
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleRemoveWallet(w.id, e)}
                                                        className="w-8 h-8 flex items-center justify-center border border-[#222] text-[#444] hover:text-red-500 hover:border-red-900 hover:bg-red-900/10 transition-all"
                                                        title="Remove Wallet"
                                                    >
                                                        <IconTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* --- VERIFICATION MODAL --- */}
                {
                    activeWallet && (
                        <WalletVerificationModal
                            walletAddress={activeWallet.address}
                            onClose={() => setSelectedWalletId(null)}
                        />
                    )
                }

            </div >
        </main >
    )
}

// --- SUB-COMPONENT: VERIFICATION MODAL ---
function WalletVerificationModal({ walletAddress, onClose }: { walletAddress: string, onClose: () => void }) {
    const [step, setStep] = useState(1) // 1: Provenance, 2: Credentials
    const [fundingSource, setFundingSource] = useState<'cex' | 'wallet' | 'bridge' | null>(null)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative bg-[#0a0a0a] border border-[#222] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-2xl shadow-black">

                {/* Header */}
                <div className="bg-[#0f0f0f] border-b border-[#222] p-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-[0.2em] uppercase flex items-center gap-2">
                            <IconShield /> Verification Protocol
                        </h3>
                        <p className="text-[10px] text-[#555] uppercase mt-1 tracking-wider">Target: {walletAddress}</p>
                    </div>
                    <button onClick={onClose} className="text-[#444] hover:text-white transition-colors text-xl leading-none">&times;</button>
                </div>

                {/* Body */}
                <div className="p-8">

                    {/* STEP 1: PROVENANCE */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h4 className="text-white text-xs font-bold uppercase tracking-widest">Step 01 // Establish Provenance</h4>
                                <p className="text-[11px] text-[#777] leading-relaxed">
                                    To maintain ethical standards, please indicate the original funding source of this wallet.
                                    We verify this against on-chain data before enabling rescue tools.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {(['cex', 'wallet', 'bridge'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFundingSource(type)}
                                        className={`p-4 border text-left transition-all ${fundingSource === type ? 'bg-white text-black border-white' : 'bg-[#050505] border-[#222] text-[#666] hover:border-[#444]'}`}
                                    >
                                        <div className="text-[10px] font-bold uppercase tracking-widest mb-1">{type === 'cex' ? 'Exchange (CEX)' : type === 'wallet' ? 'Personal Wallet' : 'Bridge / Other'}</div>
                                        <div className="text-[9px] opacity-70">
                                            {type === 'cex' ? 'Binance, Coinbase...' : type === 'wallet' ? 'Metamask, HW...' : 'L2s, Mixers...'}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Verification Input Area based on selection */}
                            <div className="min-h-[120px] bg-[#080808] border border-[#1a1a1a] p-6 flex flex-col justify-center items-center">
                                {!fundingSource ? (
                                    <div className="text-[10px] text-[#444] uppercase tracking-widest">Select a source above</div>
                                ) : fundingSource === 'cex' ? (
                                    <div className="text-center w-full">
                                        <div className="border border-dashed border-[#333] hover:border-[#666] hover:bg-[#0c0c0c] transition-colors p-6 cursor-pointer w-full group">
                                            <span className="text-[10px] text-[#666] group-hover:text-white uppercase tracking-widest block mb-2">Drag & Drop .eml Receipt</span>
                                            <span className="text-[9px] text-[#444]">Withdrawal confirmation email</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center w-full">
                                        <textarea
                                            className="w-full bg-[#050505] border border-[#222] text-xs text-white p-3 h-20 outline-none focus:border-[#444]"
                                            placeholder="Please describe the funding transaction hash or method..."
                                        ></textarea>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-[#1a1a1a]">
                                <button onClick={onClose} className="text-[10px] uppercase tracking-widest text-[#555] hover:text-white transition-colors">Cancel</button>
                                <button
                                    disabled={!fundingSource}
                                    onClick={() => setStep(2)}
                                    className="bg-white text-black px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#ccc] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Proceed to Credentials &rarr;
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: CREDENTIALS */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="bg-red-500/5 border border-red-900/30 p-4 flex gap-3">
                                <div className="text-red-500"><IconAlert /></div>
                                <div>
                                    <h4 className="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-1">Encrypted Environment</h4>
                                    <p className="text-[10px] text-[#999] leading-relaxed">
                                        You are entering the specialized simulation zone. Your Private Key will be encrypted client-side using standard AES-256-GCM before being used in the secure sandbox.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] text-[#666] uppercase tracking-widest font-bold">
                                    Compromised Wallet Private Key
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        className="w-full bg-[#050505] border border-[#333] focus:border-red-500/50 text-white font-mono p-4 pr-12 text-xs outline-none transition-colors placeholder-[#333]"
                                        placeholder="0x..."
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-[#333] uppercase tracking-widest border border-[#222] px-2 py-1">
                                        SECURE
                                    </div>
                                </div>
                                <p className="text-[9px] text-[#444] text-justify">
                                    * The key is never stored on our persistent databases. It is used strictly for generating the counter-transactions (sweeps) in the ephemeral runtime.
                                </p>
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-[#1a1a1a] mt-6">
                                <button onClick={() => setStep(1)} className="text-[10px] uppercase tracking-widest text-[#555] hover:text-white transition-colors">&larr; Back</button>
                                <button
                                    className="bg-red-600 text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all"
                                >
                                    Start Rescue Simulation
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}