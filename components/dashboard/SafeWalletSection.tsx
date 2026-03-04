"use client"

import { useTranslations } from "next-intl"
import { ETH_ADDRESS_REGEX, IconAlert } from "./types"
import { ContactLinks } from "@/components/ContactLinks"
import { CONTACT } from "@/lib/constants"

interface SafeWalletSectionProps {
    safeWallet: string
    canChangeWallet: boolean
    remainingHours: number
    tempSafeWallet: string
    setTempSafeWallet: (v: string) => void
    safeWalletLoading: boolean
    safeWalletError: string | null
    setSafeWalletError: (v: string | null) => void
    changingWallet: boolean
    setChangingWallet: (v: boolean) => void
    onSave: (e: React.FormEvent) => void
}

export function SafeWalletSection({
    safeWallet, canChangeWallet: canChange, remainingHours,
    tempSafeWallet, setTempSafeWallet,
    safeWalletLoading, safeWalletError, setSafeWalletError,
    changingWallet, setChangingWallet,
    onSave,
}: SafeWalletSectionProps) {
    const t = useTranslations()

    const isValidEthAddress = (addr: string) => ETH_ADDRESS_REGEX.test(addr)

    return (
        <section className={`${!safeWallet ? 'opacity-100' : 'opacity-80 hover:opacity-100 transition-opacity'}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold tracking-[0.2em] text-[#999] uppercase flex items-center gap-2">
                    {t.rich("Dashboard.safeWallet.sectionTitle", {
                        white: (chunks) => <span className="text-white">{chunks}</span>,
                    })}
                </h2>
                {safeWallet && (
                    <div className="text-[9px] text-emerald-500 border border-emerald-900/50 px-2 py-1 uppercase tracking-wider bg-emerald-500/5">
                        {t("Dashboard.safeWallet.savedBadge")}
                    </div>
                )}
            </div>

            {!safeWallet ? (
                <div className="bg-[#080808] border border-[#333] p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <p className="text-sm text-[#ccc] mb-4 max-w-xl leading-relaxed">
                        <strong className="text-white">{t("Dashboard.safeWallet.setTitle")}</strong> {t("Dashboard.safeWallet.setDescription")}
                    </p>

                    {/* Warning Notice */}
                    <div className="bg-yellow-500/5 border border-yellow-900/30 p-4 mb-6 flex gap-3">
                        <div className="text-yellow-600 shrink-0"><IconAlert /></div>
                        <div className="text-[10px] text-[#999] leading-relaxed space-y-2">
                            <p>
                                {t.rich("Dashboard.safeWallet.warning", {
                                    strong: (chunks) => <strong className="text-white">{chunks}</strong>,
                                    xLink: (chunks) => <a href={CONTACT.X_URL} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">{chunks}</a>,
                                    emailLink: (chunks) => <a href={CONTACT.EMAIL_URL} className="text-white hover:underline">{chunks}</a>,
                                })}
                            </p>
                            <p className="text-red-500">
                                {t.rich("Dashboard.safeWallet.cexWarning", {
                                    strong: (chunks) => <strong>{chunks}</strong>,
                                })}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={onSave} className="flex flex-col gap-4">
                        <div>
                            <input
                                type="text"
                                placeholder={t("Dashboard.safeWallet.placeholder")}
                                value={tempSafeWallet}
                                onChange={(e) => { setTempSafeWallet(e.target.value); setSafeWalletError(null) }}
                                className={`w-full h-14 bg-[#050505] border ${safeWalletError ? 'border-red-900/50' : 'border-[#222] focus:border-white'} px-4 text-white font-mono placeholder-[#666] outline-none transition-colors`}
                            />
                            {tempSafeWallet && !isValidEthAddress(tempSafeWallet) && (
                                <p className="text-[9px] text-[#999] mt-2 tracking-wider">
                                    {t("Dashboard.safeWallet.formatHint")}
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
                            {safeWalletLoading ? t("Common.actions.saving") : t("Dashboard.safeWallet.confirmDestination")}
                        </button>
                    </form>
                </div>
            ) : changingWallet ? (
                <div className="bg-[#080808] border border-[#333] p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <p className="text-sm text-[#ccc] mb-4 max-w-xl leading-relaxed">
                        <strong className="text-white">{t("Dashboard.safeWallet.changeTitle")}</strong> {t("Dashboard.safeWallet.changeDescription")}
                    </p>

                    <div className="bg-red-500/5 border border-red-900/30 p-4 mb-6 flex gap-3">
                        <div className="text-red-500 shrink-0"><IconAlert /></div>
                        <p className="text-[10px] text-[#999] leading-relaxed">
                            {t.rich("Dashboard.safeWallet.changeCexWarning", {
                                strong: (chunks) => <strong className="text-red-500">{chunks}</strong>,
                                highlight: (chunks) => <strong className="text-white">{chunks}</strong>,
                            })}
                        </p>
                    </div>

                    <form onSubmit={onSave} className="flex flex-col gap-4">
                        <div>
                            <input
                                type="text"
                                placeholder={t("Dashboard.safeWallet.newPlaceholder")}
                                value={tempSafeWallet}
                                onChange={(e) => { setTempSafeWallet(e.target.value); setSafeWalletError(null) }}
                                className={`w-full h-14 bg-[#050505] border ${safeWalletError ? 'border-red-900/50' : 'border-[#222] focus:border-white'} px-4 text-white font-mono placeholder-[#666] outline-none transition-colors`}
                            />
                            {tempSafeWallet && !isValidEthAddress(tempSafeWallet) && (
                                <p className="text-[9px] text-[#999] mt-2 tracking-wider">
                                    {t("Dashboard.safeWallet.formatHint")}
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
                                {t("Common.actions.cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={!isValidEthAddress(tempSafeWallet) || safeWalletLoading}
                                className="h-12 px-8 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#ddd] disabled:bg-[#222] disabled:text-[#aaa] disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                {safeWalletLoading ? t("Common.actions.saving") : t("Dashboard.safeWallet.confirmNewAddress")}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="pl-2 border-l-2 border-emerald-500/50">
                                <div className="text-[9px] text-[#aaa] uppercase tracking-widest mb-1">{t("Dashboard.safeWallet.label")}</div>
                                <div className="text-white font-mono text-sm md:text-xl tracking-tight break-all">{safeWallet}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => canChange && setChangingWallet(true)}
                            disabled={!canChange}
                            className={`text-[9px] uppercase tracking-widest transition-all px-4 py-2 border cursor-pointer ${canChange
                                ? 'text-[#aaa] hover:text-white border-[#222] hover:border-[#444]'
                                : 'text-[#999] border-[#1a1a1a] cursor-not-allowed'
                                }`}
                            title={!canChange ? `Available in ${remainingHours}h` : undefined}
                        >
                            {canChange ? t("Common.actions.change") : t("Dashboard.safeWallet.locked", { hours: remainingHours })}
                        </button>
                    </div>

                    <div className="border-t border-[#1a1a1a] px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <p className="text-[9px] text-[#aaa] leading-relaxed">
                            {t("Dashboard.safeWallet.infoText")}
                        </p>
                        <ContactLinks />
                    </div>
                </div>
            )}
        </section>
    )
}
