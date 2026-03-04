import { Link } from "@/i18n/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

export default async function AuthCodeErrorPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations("AuthError")

    return (
        <main className="min-h-screen w-full bg-[#050505] text-[#e5e5e5] font-mono flex items-center justify-center">
            <div className="max-w-md w-full mx-auto p-8 text-center space-y-6">
                <div className="text-red-500 text-[10px] font-bold uppercase tracking-[0.3em]">
                    {t("badge")}
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    {t("title")}
                </h1>
                <p className="text-sm text-[#999] leading-relaxed">
                    {t("description")}
                </p>
                <Link
                    href="/"
                    className="inline-block mt-4 px-8 py-3 bg-white text-black text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#ddd] transition-colors"
                >
                    {t("returnButton")}
                </Link>
            </div>
        </main>
    )
}
