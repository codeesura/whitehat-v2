import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import "@/styles/globals.css"

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://whitehat.codeesura.dev"),
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
