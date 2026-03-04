"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Link, useRouter } from "@/i18n/navigation"
import { createClient } from "@/lib/supabase/client"
import { getAddress } from "viem"
import { privateKeyToAddress } from "viem/accounts"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { WalletSubmission, ETH_ADDRESS_REGEX } from "@/components/dashboard/types"
import { SafeWalletSection } from "@/components/dashboard/SafeWalletSection"
import { SubmitWalletSection } from "@/components/dashboard/SubmitWalletSection"
import { SubmissionsList } from "@/components/dashboard/SubmissionsList"
import { OwnershipVerificationModal } from "@/components/dashboard/OwnershipVerificationModal"

const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000

function computeCooldown(updatedAt: string | null) {
    if (!updatedAt) return { canChange: true, remainingHours: 0 }
    const remaining = COOLDOWN_MS - (Date.now() - new Date(updatedAt).getTime())
    return {
        canChange: remaining <= 0,
        remainingHours: Math.max(0, Math.ceil(remaining / (1000 * 60 * 60))),
    }
}

export default function DashboardPage() {
    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])
    const t = useTranslations()

    // --- STATE MANAGEMENT ---
    const [safeWallet, setSafeWallet] = useState<string>("")
    const [canChangeWallet, setCanChangeWallet] = useState(true)
    const [remainingHours, setRemainingHours] = useState(0)
    const [tempSafeWallet, setTempSafeWallet] = useState("")
    const [safeWalletLoading, setSafeWalletLoading] = useState(false)
    const [safeWalletError, setSafeWalletError] = useState<string | null>(null)
    const [changingWallet, setChangingWallet] = useState(false)
    const [loading, setLoading] = useState(true)
    const [initError, setInitError] = useState<string | null>(null)

    const [userProfile, setUserProfile] = useState<{ displayName: string, handle: string, avatarUrl: string | null }>({
        displayName: t("Common.loading"),
        handle: "...",
        avatarUrl: null
    })

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/')
                    return
                }

                const metadata = user.user_metadata
                const displayName = metadata.full_name || metadata.name || metadata.preferred_username || metadata.user_name || "Whitehat Agent"
                let handle = metadata.preferred_username || metadata.user_name || metadata.name || user.email?.split('@')[0] || "operator"
                if (!handle.startsWith('@')) handle = `@${handle}`
                const avatar = metadata.avatar_url || metadata.picture || metadata.image || null
                setUserProfile({ displayName, handle, avatarUrl: avatar })

                const [profileRes, walletsRes] = await Promise.all([
                    fetch('/api/profile'),
                    fetch('/api/wallets'),
                ])

                if (profileRes.ok) {
                    const profile = await profileRes.json()
                    if (profile.safe_wallet_address) setSafeWallet(profile.safe_wallet_address)
                    const cd = computeCooldown(profile.updated_at)
                    setCanChangeWallet(cd.canChange)
                    setRemainingHours(cd.remainingHours)
                }

                if (walletsRes.ok) {
                    setWallets(await walletsRes.json())
                }
            } catch (err) {
                console.error('Dashboard init failed:', err)
                setInitError(t("Dashboard.initError.defaultMessage"))
            } finally {
                setLoading(false)
            }
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

    const isValidEthAddress = (addr: string) => {
        if (!ETH_ADDRESS_REGEX.test(addr)) return false
        try {
            getAddress(addr)
            return true
        } catch {
            return false
        }
    }

    const derivedAddress = useMemo(() => {
        if (!newPrivateKey) return null
        try {
            const normalized = newPrivateKey.startsWith('0x')
                ? newPrivateKey
                : `0x${newPrivateKey}`
            return privateKeyToAddress(normalized as `0x${string}`)
        } catch {
            return null
        }
    }, [newPrivateKey])

    const fetchWallets = async () => {
        try {
            const res = await fetch('/api/wallets')
            if (res.ok) {
                const data = await res.json()
                setWallets(data)
            }
        } catch (err) {
            console.error('Failed to fetch wallets:', err)
        }
    }

    const handleSubmitPrivateKey = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)

        if (!derivedAddress) {
            setSubmitError(t("Dashboard.submitWallet.invalidKey"))
            return
        }

        setSubmitLoading(true)
        try {
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
        } catch {
            setSubmitError(t("Dashboard.submitWallet.networkError"))
        } finally {
            setSubmitLoading(false)
        }
    }

    const handleSaveSafeWallet = async (e: React.FormEvent) => {
        e.preventDefault()
        setSafeWalletError(null)

        if (!isValidEthAddress(tempSafeWallet)) {
            setSafeWalletError(t("Dashboard.safeWallet.invalidAddress"))
            return
        }

        setSafeWalletLoading(true)
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ safe_wallet_address: tempSafeWallet }),
            })

            if (res.ok) {
                const data = await res.json()
                setSafeWallet(data.safe_wallet_address)
                const cd = computeCooldown(data.updated_at)
                setCanChangeWallet(cd.canChange)
                setRemainingHours(cd.remainingHours)
                setTempSafeWallet("")
                setChangingWallet(false)
            } else {
                const data = await res.json()
                setSafeWalletError(data.error)
            }
        } catch {
            setSafeWalletError(t("Dashboard.submitWallet.networkError"))
        } finally {
            setSafeWalletLoading(false)
        }
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
                        <div className="text-[#999] text-[10px] uppercase tracking-[0.3em]">{t("Dashboard.loading")}</div>
                    </div>
                </div>
            ) : initError ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-center max-w-md">
                        <div className="text-red-500 text-[10px] font-bold uppercase tracking-[0.3em]">{t("Dashboard.initError.badge")}</div>
                        <p className="text-sm text-[#999]">{initError}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 px-6 py-3 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#ddd] transition-colors cursor-pointer"
                        >
                            {t("Common.actions.retry")}
                        </button>
                    </div>
                </div>
            ) : (<>

            {/* --- HEADER --- */}
            <header className="relative z-20 w-full px-6 py-5 md:px-8 border-b border-[#1a1a1a] bg-[#050505]/80 backdrop-blur-md flex justify-between items-center">
                <div className="flex items-center gap-4 text-[10px] md:text-xs tracking-[0.3em] text-[#999] uppercase">
                    <Link href="/" className="flex items-center gap-4 hover:text-white transition-colors cursor-pointer group">
                        <span className="w-6 md:w-8 h-[1px] bg-[#333] group-hover:bg-white transition-colors"></span>
                        <span className="text-white font-bold">{t("Dashboard.headerBrand")}</span>
                    </Link>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    <LanguageSwitcher />
                    <div className="flex items-center gap-3 md:border-r md:border-[#222] md:pr-6">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-[#111] rounded-full border border-[#222] flex items-center justify-center overflow-hidden relative shrink-0">
                            {userProfile.avatarUrl ? (
                                <Image
                                    src={userProfile.avatarUrl}
                                    alt={userProfile.displayName}
                                    fill
                                    sizes="32px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-[#222] to-[#444]"></div>
                            )}
                        </div>
                        <div className="hidden md:flex flex-col text-right">
                            <span className="text-[10px] font-bold text-white tracking-widest uppercase">{userProfile.displayName}</span>
                            <span className="text-[9px] text-[#aaa] tracking-widest uppercase">{userProfile.handle.toLowerCase()}</span>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="text-[#999] hover:text-red-500 border border-[#222] hover:border-red-900 w-8 h-8 md:w-auto md:h-auto flex items-center justify-center md:px-4 md:py-2 md:text-[10px] md:uppercase md:tracking-[0.2em] transition-all" aria-label={t("Dashboard.logout")}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0 md:hidden"><path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" /><path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" /></svg>
                        <span className="hidden md:inline">{t("Dashboard.logout")}</span>
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <div className="relative z-10 max-w-4xl mx-auto w-full p-6 md:p-12 grid gap-12">

                <SafeWalletSection
                    safeWallet={safeWallet}
                    canChangeWallet={canChangeWallet}
                    remainingHours={remainingHours}
                    tempSafeWallet={tempSafeWallet}
                    setTempSafeWallet={setTempSafeWallet}
                    safeWalletLoading={safeWalletLoading}
                    safeWalletError={safeWalletError}
                    setSafeWalletError={setSafeWalletError}
                    changingWallet={changingWallet}
                    setChangingWallet={setChangingWallet}
                    onSave={handleSaveSafeWallet}
                />

                <SubmitWalletSection
                    safeWallet={safeWallet}
                    newPrivateKey={newPrivateKey}
                    setNewPrivateKey={setNewPrivateKey}
                    derivedAddress={derivedAddress}
                    submitLoading={submitLoading}
                    submitError={submitError}
                    setSubmitError={setSubmitError}
                    onSubmit={handleSubmitPrivateKey}
                />

                <SubmissionsList
                    wallets={wallets}
                    onSelect={setSelectedWalletId}
                />

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
