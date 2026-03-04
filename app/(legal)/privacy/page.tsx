import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy // Whitehat Rescue Ops",
  description: "Privacy Policy for Whitehat Rescue Ops — how we collect, use, and protect your data.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#e5e5e5]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#050505]/80 backdrop-blur-md px-6 py-5 md:px-8 md:py-6 flex justify-between items-center">
        <div className="flex items-center gap-4 text-[10px] md:text-xs tracking-[0.3em] text-[#999] uppercase">
          <span className="w-6 md:w-8 h-[1px] bg-[#333]"></span>
          <a href="/" className="text-white font-bold hover:text-[#ccc] transition-colors">CODEESURA // V2</a>
        </div>
        <div className="text-[10px] text-[#666] tracking-widest uppercase">PRIVACY POLICY</div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 md:px-8 md:py-16">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-[11px] text-[#666] uppercase tracking-widest mb-12">Last updated: March 4, 2026</p>

        <div className="space-y-10 text-sm text-[#bbb] leading-relaxed">
          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">1. Introduction</h2>
            <p>
              Whitehat Rescue Ops (&quot;Service&quot;), operated by codeesura, provides asset recovery services
              for compromised EVM wallets. This Privacy Policy explains how we collect, use, store, and
              protect your personal information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">2. Data We Collect</h2>
            <ul className="space-y-2 ml-4">
              <li className="before:content-['//'] before:text-[#666] before:mr-2">
                <span className="text-white">Private Keys</span> — Submitted voluntarily by you for compromised wallet rescue. Encrypted using RSA before storage.
              </li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">
                <span className="text-white">.eml Files</span> — Exchange withdrawal confirmation emails uploaded for DKIM-based ownership verification.
              </li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">
                <span className="text-white">OAuth Profile Data</span> — Basic profile information (username, avatar, ID) from Twitter/X or Discord when you log in.
              </li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">
                <span className="text-white">Wallet Addresses</span> — Derived from submitted private keys and safe destination addresses you provide.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">3. How We Use Your Data</h2>
            <ul className="space-y-2 ml-4">
              <li className="before:content-['//'] before:text-[#666] before:mr-2">To execute asset rescue operations on your compromised wallets.</li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">To verify wallet ownership through DKIM email signature validation.</li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">To trace funding sources across EVM chains for verification purposes.</li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">To authenticate your identity and maintain session security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">4. Encryption &amp; Security</h2>
            <p>
              All private keys are encrypted using <span className="text-white">RSA asymmetric encryption</span> before
              being stored. Only the operator holds the decryption key. Raw private keys are never stored in plaintext
              and are discarded from server memory immediately after encryption.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">5. Cookies</h2>
            <p>
              We use cookies strictly for <span className="text-white">authentication session management</span> via
              Supabase Auth. These cookies are essential for the Service to function and maintain your logged-in state.
              We do not use analytics, advertising, or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">6. Third-Party Services</h2>
            <ul className="space-y-2 ml-4">
              <li className="before:content-['//'] before:text-[#666] before:mr-2">
                <span className="text-white">Supabase</span> — Authentication, database, and storage infrastructure.
              </li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">
                <span className="text-white">Routescan</span> — Blockchain explorer API for tracing wallet funding transactions across EVM chains.
              </li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">
                <span className="text-white">Twitter/X &amp; Discord</span> — OAuth providers for user authentication.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">7. Data Retention</h2>
            <p>
              Your data is retained for as long as necessary to complete rescue operations and provide ongoing
              support. Encrypted private keys are stored until the rescue is completed or you request deletion.
              You may request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">8. Your Rights</h2>
            <p>
              You have the right to request access to, correction of, or deletion of your personal data.
              You may withdraw your consent at any time by contacting us. Note that withdrawal of consent
              may affect our ability to provide rescue services for your submitted wallets.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">9. Contact</h2>
            <p>
              For any privacy-related inquiries, data requests, or concerns, contact us at:{" "}
              <a href="mailto:contact@codeesura.dev" className="text-white underline underline-offset-4 hover:text-[#ccc] transition-colors">
                contact@codeesura.dev
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] bg-[#050505] py-4 px-6 md:px-8 flex justify-between items-center text-[9px] text-[#666] tracking-[0.2em]">
        <span>CODEESURA // WHITEHAT RESCUE OPS</span>
        <a href="/terms" className="hover:text-white transition-colors">TERMS OF SERVICE</a>
      </footer>
    </div>
  )
}
