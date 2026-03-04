import type { MetadataRoute } from "next"
import { routing } from "@/i18n/routing"

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://whitehat.codeesura.dev"

    const localePages = routing.locales.map((locale) => ({
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: locale === "en" ? 1.0 : 0.8,
    }))

    const legalPages = [
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.3,
        },
    ]

    return [...localePages, ...legalPages]
}
