"use client"

import { useTranslations, useLocale } from "next-intl"
import { WalletSubmission, dateLocaleMap } from "./types"

interface SubmissionsListProps {
    wallets: WalletSubmission[]
    onSelect: (id: string) => void
}

export function SubmissionsList({ wallets, onSelect }: SubmissionsListProps) {
    const t = useTranslations()
    const locale = useLocale()
    const dateLocale = dateLocaleMap[locale] || 'en-GB'

    if (wallets.length === 0) return null

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold tracking-[0.2em] text-[#999] uppercase flex items-center gap-2">
                    {t.rich("Dashboard.submissions.sectionTitle", {
                        white: (chunks) => <span className="text-white">{chunks}</span>,
                    })}
                </h2>
                <div className="flex items-center gap-3">
                    {wallets.filter(w => w.status === 'verified').length > 0 && (
                        <span className="text-[9px] text-emerald-500 border border-emerald-900/50 px-2 py-1 uppercase tracking-wider bg-emerald-500/5">
                            {t("Dashboard.submissions.verified", { count: wallets.filter(w => w.status === 'verified').length })}
                        </span>
                    )}
                    {wallets.filter(w => w.status === 'eml_required').length > 0 && (
                        <span className="text-[9px] text-orange-400 border border-orange-900/50 px-2 py-1 uppercase tracking-wider bg-orange-500/5">
                            {t("Dashboard.submissions.emlRequired", { count: wallets.filter(w => w.status === 'eml_required').length })}
                        </span>
                    )}
                    {wallets.filter(w => w.status === 'pending').length > 0 && (
                        <span className="text-[9px] text-yellow-500 border border-yellow-900/50 px-2 py-1 uppercase tracking-wider bg-yellow-500/5">
                            {t("Dashboard.submissions.pending", { count: wallets.filter(w => w.status === 'pending').length })}
                        </span>
                    )}
                    <span className="text-[9px] text-[#aaa] border border-[#222] px-2 py-1 uppercase tracking-wider bg-[#111]">
                        {t("Dashboard.submissions.total", { count: wallets.length })}
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
                    const statusKey: Record<string, string> = {
                        pending: 'statusPending',
                        eml_required: 'statusEmlRequired',
                        verified: 'statusVerified',
                        in_progress: 'statusInProgress',
                        completed: 'statusCompleted',
                        rejected: 'statusRejected',
                    }
                    const isClickable = ['pending', 'eml_required', 'verified', 'rejected'].includes(w.status)
                    return (
                        <div
                            key={w.id}
                            className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#0c0c0c] transition-colors ${isClickable ? 'cursor-pointer' : ''}`}
                            onClick={() => isClickable && onSelect(w.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-[#999] text-[10px] font-bold w-6">{String(wallets.length - i).padStart(2, '0')}</div>
                                <div>
                                    <div className="text-sm text-white font-mono truncate max-w-[200px] md:max-w-none">{w.compromised_address}</div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={`text-[9px] uppercase tracking-widest ${statusColors[w.status] ?? 'text-[#aaa]'}`}>
                                            {statusKey[w.status] ? t(`Dashboard.submissions.${statusKey[w.status]}` as "Dashboard.submissions.statusPending") : w.status}
                                        </span>
                                        {w.funding_cex_name && (
                                            <span className="text-[9px] text-[#999] uppercase tracking-widest">
                                                {t("Dashboard.submissions.via", { cex: w.funding_cex_name })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-[9px] text-[#999] text-right">
                                    {new Date(w.created_at).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
                                    {' '}
                                    {new Date(w.created_at).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}
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
    )
}
