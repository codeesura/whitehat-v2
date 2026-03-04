import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service // Whitehat Rescue Ops",
  description: "Terms of Service for Whitehat Rescue Ops — conditions for using our asset recovery service.",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#e5e5e5]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#050505]/80 backdrop-blur-md px-6 py-5 md:px-8 md:py-6 flex justify-between items-center">
        <div className="flex items-center gap-4 text-[10px] md:text-xs tracking-[0.3em] text-[#999] uppercase">
          <span className="w-6 md:w-8 h-[1px] bg-[#333]"></span>
          <a href="/" className="text-white font-bold hover:text-[#ccc] transition-colors">CODEESURA // V2</a>
        </div>
        <div className="text-[10px] text-[#666] tracking-widest uppercase">TERMS OF SERVICE</div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 md:px-8 md:py-16">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Terms of Service</h1>
        <p className="text-[11px] text-[#666] uppercase tracking-widest mb-12">Last updated: March 4, 2026</p>

        <div className="space-y-10 text-sm text-[#bbb] leading-relaxed">
          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">1. Service Description</h2>
            <p>
              Whitehat Rescue Ops (&quot;Service&quot;) provides asset recovery assistance for compromised
              EVM-compatible blockchain wallets. The Service includes counter-sweeper strategy execution,
              ownership verification via DKIM email validation, and secure asset transfer to a
              user-designated safe wallet.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">2. Commission</h2>
            <p>
              A commission of <span className="text-white font-bold">15%</span> of the total recovered asset
              value is charged for successful rescue operations. The commission is deducted from the recovered
              assets before they are transferred to your safe wallet. No fee is charged if no assets are
              successfully recovered.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">3. No Guarantee of Recovery</h2>
            <p>
              Asset recovery from compromised wallets is inherently uncertain. The Service{" "}
              <span className="text-white">does not guarantee</span> that any or all assets will be
              successfully recovered. Factors beyond our control — including sweeper bot speed, gas price
              competition, smart contract restrictions, and blockchain network conditions — may prevent
              partial or complete recovery.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">4. Voluntary Private Key Submission</h2>
            <p>
              By submitting a private key through the Service, you confirm that:
            </p>
            <ul className="space-y-2 ml-4 mt-3">
              <li className="before:content-['//'] before:text-[#666] before:mr-2">You are the rightful owner of the wallet associated with the submitted private key.</li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">You submit the private key voluntarily and of your own free will.</li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">You understand the risks involved in sharing a private key with a third party.</li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">You authorize the operator to use the private key solely for asset rescue purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">5. Limitation of Liability</h2>
            <p>
              The Service is provided <span className="text-white">&quot;as is&quot;</span> without warranties of any kind,
              express or implied. The operator shall not be liable for any direct, indirect, incidental,
              consequential, or special damages arising from your use of the Service, including but not
              limited to loss of assets, failed recovery attempts, or delays in service execution.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">6. Scope of Service</h2>
            <ul className="space-y-2 ml-4">
              <li className="before:content-['//'] before:text-[#666] before:mr-2">The Service operates exclusively on EVM-compatible blockchain networks.</li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">Recovery targets include: native tokens, ERC-20 tokens, staked positions, pending airdrops, and vesting contracts.</li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">NFTs and non-standard token types may or may not be recoverable depending on contract implementation.</li>
              <li className="before:content-['//'] before:text-[#666] before:mr-2">The operator reserves the right to decline rescue requests at their sole discretion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">7. Acceptance</h2>
            <p>
              By creating an account and using the Service, you acknowledge that you have read, understood,
              and agree to be bound by these Terms of Service and the{" "}
              <a href="/privacy" className="text-white underline underline-offset-4 hover:text-[#ccc] transition-colors">
                Privacy Policy
              </a>
              . If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">8. Modifications</h2>
            <p>
              The operator reserves the right to modify these Terms at any time. Continued use of the
              Service after changes constitutes acceptance of the updated Terms. Material changes will
              be communicated through the Service interface.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-l-2 border-white pl-4">9. Contact</h2>
            <p>
              For questions about these Terms, contact us at:{" "}
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
        <a href="/privacy" className="hover:text-white transition-colors">PRIVACY POLICY</a>
      </footer>
    </div>
  )
}
