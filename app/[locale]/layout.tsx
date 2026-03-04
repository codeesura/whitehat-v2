import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import "@/styles/globals.css";

const rtlLocales = new Set(["ar", "fa"]);

const ogLocaleMap: Record<string, string> = {
  en: "en_US", tr: "tr_TR", es: "es_ES", fr: "fr_FR", de: "de_DE",
  pt: "pt_BR", ru: "ru_RU", zh: "zh_CN", ja: "ja_JP", ko: "ko_KR",
  ar: "ar_SA", hi: "hi_IN", vi: "vi_VN", th: "th_TH", id: "id_ID",
  tl: "fil_PH", uk: "uk_UA", fa: "fa_IR", pl: "pl_PL",
};

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://whitehat.codeesura.dev";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("description"),
    keywords: [
      "Whitehat",
      "Wallet Recovery",
      "Compromised Wallet",
      "Sweeper Bot",
      "Counter-Sweeper",
      "EVM",
      "Asset Rescue",
      "Private Key",
      "Blockchain Security",
      "codeesura",
    ],
    authors: [{ name: "codeesura", url: "https://codeesura.dev" }],
    creator: "codeesura",
    icons: {
      icon: "/icon.svg",
      apple: "/icon.svg",
    },
    manifest: "/manifest.webmanifest",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, `${baseUrl}/${l}`])
        ),
        "x-default": `${baseUrl}/en`,
      },
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      creator: "@codeesura",
    },
    openGraph: {
      type: "website",
      siteName: "Whitehat Rescue Ops",
      title: t("title"),
      description: t("description"),
      locale: ogLocaleMap[locale] || "en_US",
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => ogLocaleMap[l] || l),
      url: `${baseUrl}/${locale}`,
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = rtlLocales.has(locale) ? "rtl" : "ltr";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://whitehat.codeesura.dev";

  return (
    <html lang={locale} dir={dir}>
      <body className={`${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebApplication",
                  "@id": `${baseUrl}/#app`,
                  name: "Whitehat Rescue Ops",
                  url: baseUrl,
                  description: "Secure asset recovery service for compromised EVM wallets using counter-sweeper strategies.",
                  applicationCategory: "SecurityApplication",
                  operatingSystem: "Web",
                  creator: {
                    "@type": "Person",
                    name: "codeesura",
                    url: "https://codeesura.dev",
                    sameAs: [
                      "https://twitter.com/codeesura",
                      "https://github.com/codeesura",
                    ],
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": `${baseUrl}/#website`,
                  url: baseUrl,
                  name: "Whitehat Rescue Ops",
                  description: "Secure asset recovery for compromised EVM wallets",
                  inLanguage: locale,
                },
              ],
            }),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
