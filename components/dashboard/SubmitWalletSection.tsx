"use client"

import { useTranslations } from "next-intl"

interface SubmitWalletSectionProps {
    safeWallet: string
    newPrivateKey: string
    setNewPrivateKey: (v: string) => void
    derivedAddress: string | null
    submitLoading: boolean
    submitError: string | null
    setSubmitError: (v: string | null) => void
    onSubmit: (e: React.FormEvent) => void
}

export function SubmitWalletSection({
    safeWallet,
    newPrivateKey, setNewPrivateKey,
    derivedAddress,
    submitLoading, submitError, setSubmitError,
    onSubmit,
}: SubmitWalletSectionProps) {
    const t = useTranslations()

    return (
        <section className={`transition-all duration-500 ${!safeWallet ? 'opacity-30 pointer-events-none blur-[2px]' : 'opacity-100'}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold tracking-[0.2em] text-[#999] uppercase flex items-center gap-2">
                    {t.rich("Dashboard.submitWallet.sectionTitle", {
                        white: (chunks) => <span className="text-white">{chunks}</span>,
                    })}
                </h2>
            </div>

            <div className="bg-[#0a0a0a] border-t border-[#1a1a1a]">
                <div className="bg-[#111]/30 p-4 border-b border-[#1a1a1a]">
                    <p className="text-[10px] text-[#999] leading-relaxed max-w-2xl">
                        {t.rich("Dashboard.submitWallet.description", {
                            strong: (chunks) => <strong className="text-white">{chunks}</strong>,
                        })}
                    </p>
                </div>

                <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-4">
                    <div>
                        <div className={`border ${derivedAddress ? 'border-emerald-900/50' : newPrivateKey ? 'border-red-900/50' : 'border-[#333]'} focus-within:border-[#555] transition-colors bg-[#080808] relative`}>
                            <input
                                type="password"
                                autoComplete="off"
                                spellCheck={false}
                                placeholder={t("Dashboard.submitWallet.placeholder")}
                                value={newPrivateKey}
                                onChange={(e) => { setNewPrivateKey(e.target.value); setSubmitError(null) }}
                                className="w-full h-14 bg-transparent px-4 pr-28 text-sm text-white placeholder-[#666] focus:outline-none font-mono"
                            />
                            <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-widest border px-2 py-1 ${derivedAddress ? 'text-emerald-500 border-emerald-900/50' : 'text-[#999] border-[#222]'}`}>
                                {derivedAddress ? t("Dashboard.submitWallet.valid") : t("Dashboard.submitWallet.waiting")}
                            </div>
                        </div>

                        {derivedAddress && (
                            <div className="mt-3 bg-[#080808] border border-emerald-900/30 p-4 flex items-center gap-3">
                                <div className="pl-2 border-l-2 border-emerald-500/50">
                                    <div className="text-[9px] text-[#aaa] uppercase tracking-widest mb-1">{t("Dashboard.submitWallet.derivedLabel")}</div>
                                    <div className="text-emerald-400 font-mono text-sm">{derivedAddress}</div>
                                </div>
                            </div>
                        )}

                        {newPrivateKey && !derivedAddress && (
                            <p className="text-[9px] text-[#999] mt-2 tracking-wider">
                                {t("Dashboard.submitWallet.invalidKeyHint")}
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
                        {submitLoading ? t("Dashboard.submitWallet.submitting") : t("Dashboard.submitWallet.submit")}
                    </button>
                </form>
            </div>
        </section>
    )
}
