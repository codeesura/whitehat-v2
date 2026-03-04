import { CONTACT } from '@/lib/constants'

export function ContactLinks({ className = 'text-[9px]' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <a href={CONTACT.X_URL} target="_blank" rel="noopener noreferrer" className="text-[#999] hover:text-white uppercase tracking-widest transition-colors">{CONTACT.X_HANDLE}</a>
            <span className="text-[#222]">|</span>
            <a href={CONTACT.EMAIL_URL} className="text-[#999] hover:text-white uppercase tracking-widest transition-colors">{CONTACT.EMAIL}</a>
        </div>
    )
}
