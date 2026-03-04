"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { WalletSubmission } from "./types"
import { ContactLinks } from "@/components/ContactLinks"

interface OwnershipVerificationModalProps {
    wallet: WalletSubmission
    onClose: () => void
    onUpdate: () => Promise<void>
}

export function OwnershipVerificationModal({ wallet, onClose, onUpdate }: OwnershipVerificationModalProps) {
    const t = useTranslations()
    const [emlFile, setEmlFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [emlError, setEmlError] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

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
            setEmlError(t("Dashboard.modal.dropzone.onlyEml"))
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
                setEmlError(data.error || t("Dashboard.modal.uploadFailed"))
            } else {
                await onUpdate()
                onClose()
            }
        } catch {
            setEmlError(t("Dashboard.modal.networkError"))
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
                            {t("Dashboard.modal.title")}
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
                                {t("Dashboard.modal.fundingUnavailable.badge")}
                            </div>
                            <p className="text-[11px] text-[#999] leading-relaxed">
                                {t("Dashboard.modal.fundingUnavailable.description")}
                            </p>
                            <ContactLinks className="text-[10px]" />
                        </div>
                    )}

                    {/* Funding found */}
                    {hasFunding && (
                        <div className="space-y-4">
                            <h4 className="text-white text-[10px] font-bold uppercase tracking-widest border-b border-[#1a1a1a] pb-2">
                                {t("Dashboard.modal.fundingTitle")}
                            </h4>

                            <div className="bg-[#080808] border border-[#1a1a1a] p-5">
                                <div className="grid grid-cols-1 gap-3">
                                    <div>
                                        <div className="text-[9px] text-[#aaa] uppercase tracking-widest mb-1">{t("Dashboard.modal.txHash")}</div>
                                        <div className="text-[11px] text-blue-400 font-mono break-all">{wallet.funding_tx_hash}</div>
                                    </div>
                                    {hasCex && (
                                        <div>
                                            <div className="text-[9px] text-[#aaa] uppercase tracking-widest mb-1">{t("Dashboard.modal.source")}</div>
                                            <div className="text-[11px] text-orange-400 font-bold">{wallet.funding_cex_name}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* No CEX → contact required */}
                            {!hasCex && (
                                <div className="bg-yellow-500/5 border border-yellow-900/30 p-4 space-y-3">
                                    <div className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest">
                                        {t("Dashboard.modal.manualVerification.badge")}
                                    </div>
                                    <p className="text-[11px] text-[#999] leading-relaxed">
                                        {t("Dashboard.modal.manualVerification.description")}
                                    </p>
                                    <ContactLinks className="text-[10px]" />
                                </div>
                            )}

                            {/* CEX detected → .eml upload */}
                            {hasCex && needsEml && (
                                <div className="space-y-4">
                                    <div className="bg-orange-500/5 border border-orange-900/30 p-4 space-y-2">
                                        <div className="text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                                            {t("Dashboard.modal.emlRequired.badge")}
                                        </div>
                                        <p className="text-[11px] text-[#999] leading-relaxed">
                                            {t.rich("Dashboard.modal.emlRequired.description", {
                                                strong: (chunks) => <strong className="text-white">{chunks}</strong>,
                                                cex: wallet.funding_cex_name!,
                                            })}
                                        </p>
                                    </div>

                                    {/* What we verify */}
                                    <div className="bg-[#080808] border border-[#1a1a1a] p-4">
                                        <div className="text-[10px] text-[#999] uppercase tracking-widest mb-3 font-bold">{t("Dashboard.modal.verificationChecks")}</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                                            <div className="flex items-center gap-2 text-[#999]">
                                                <span className="text-white">-</span> {t("Dashboard.modal.checks.authenticity")}
                                            </div>
                                            <div className="flex items-center gap-2 text-[#999]">
                                                <span className="text-white">-</span> {t("Dashboard.modal.checks.sender", { cex: wallet.funding_cex_name! })}
                                            </div>
                                            <div className="flex items-center gap-2 text-[#999]">
                                                <span className="text-white">-</span> {t("Dashboard.modal.checks.wallet")}
                                            </div>
                                            <div className="flex items-center gap-2 text-[#999]">
                                                <span className="text-white">-</span> {t("Dashboard.modal.checks.txId")}
                                            </div>
                                        </div>
                                    </div>

                                    {/* How to download .eml */}
                                    <details className="group">
                                        <summary className="text-[10px] text-[#999] hover:text-white uppercase tracking-widest cursor-pointer transition-colors flex items-center gap-2">
                                            <span className="text-[#aaa] group-open:rotate-90 transition-transform">&#x25B6;</span>
                                            {t("Dashboard.modal.emlGuide.title")}
                                        </summary>
                                        <div className="mt-3 bg-[#080808] border border-[#1a1a1a] p-5 space-y-4 text-[11px] leading-relaxed">
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <span className="text-white font-bold text-[10px] bg-[#1a1a1a] px-2 py-0.5 shrink-0">1</span>
                                                    <div className="text-[#999]">
                                                        {t.rich("Dashboard.modal.emlGuide.step1", {
                                                            strong: (chunks) => <strong className="text-white">{chunks}</strong>,
                                                            cex: wallet.funding_cex_name!,
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <span className="text-white font-bold text-[10px] bg-[#1a1a1a] px-2 py-0.5 shrink-0">2</span>
                                                    <div className="text-[#999]">
                                                        {t.rich("Dashboard.modal.emlGuide.step2title", {
                                                            strong: (chunks) => <strong className="text-white">{chunks}</strong>,
                                                        })}
                                                        <div className="mt-2 space-y-1.5 pl-2 border-l border-[#1a1a1a]">
                                                            <div>{t.rich("Dashboard.modal.emlGuide.gmail", { strong: (chunks) => <strong className="text-[#999]">{chunks}</strong> })}</div>
                                                            <div>{t.rich("Dashboard.modal.emlGuide.outlook", { strong: (chunks) => <strong className="text-[#999]">{chunks}</strong> })}</div>
                                                            <div>{t.rich("Dashboard.modal.emlGuide.yahoo", { strong: (chunks) => <strong className="text-[#999]">{chunks}</strong> })}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <span className="text-white font-bold text-[10px] bg-[#1a1a1a] px-2 py-0.5 shrink-0">3</span>
                                                    <div className="text-[#999]">
                                                        {t("Dashboard.modal.emlGuide.step3")}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-red-500/5 border border-red-900/30 p-3 text-[10px] text-[#999]">
                                                {t.rich("Dashboard.modal.emlGuide.dkimWarning", {
                                                    strong: (chunks) => <strong className="text-white">{chunks}</strong>,
                                                })}
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
                                                <div className="text-[10px] text-[#999] uppercase tracking-widest">{t("Dashboard.modal.dropzone.drag")}</div>
                                                <div className="text-[9px] text-[#aaa]">{t("Dashboard.modal.dropzone.browse")}</div>
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
                                            {uploading ? t("Dashboard.modal.uploading") : t("Dashboard.modal.verifySubmit")}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Already verified */}
                            {wallet.eml_verified && (
                                <div className="bg-emerald-500/5 border border-emerald-900/30 p-4 space-y-2">
                                    <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                        {t("Dashboard.modal.verified.badge")}
                                    </div>
                                    <p className="text-[11px] text-[#999]">
                                        {t("Dashboard.modal.verified.description")}
                                    </p>
                                </div>
                            )}

                            {/* Rejected */}
                            {wallet.status === 'rejected' && (
                                <div className="bg-red-500/5 border border-red-900/30 p-4 space-y-2">
                                    <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                                        {t("Dashboard.modal.rejected.badge")}
                                    </div>
                                    <p className="text-[11px] text-[#999]">
                                        {t("Dashboard.modal.rejected.description")}
                                    </p>
                                    <ContactLinks className="text-[10px]" />
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
                            {t("Common.actions.close")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
