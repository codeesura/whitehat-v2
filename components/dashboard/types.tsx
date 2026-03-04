export interface WalletSubmission {
    id: string
    compromised_address: string
    safe_wallet_address: string
    funding_tx_hash: string | null
    funding_cex_name: string | null
    eml_verified: boolean
    status: string
    created_at: string
}

export const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

export const IconAlert = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
)

export const dateLocaleMap: Record<string, string> = {
    en: 'en-GB', tr: 'tr-TR', es: 'es-ES', fr: 'fr-FR',
    de: 'de-DE', pt: 'pt-BR', ru: 'ru-RU', zh: 'zh-CN',
    ja: 'ja-JP', ko: 'ko-KR', ar: 'ar-SA', hi: 'hi-IN',
    vi: 'vi-VN', th: 'th-TH', id: 'id-ID', tl: 'fil-PH',
    uk: 'uk-UA', fa: 'fa-IR', pl: 'pl-PL',
}
