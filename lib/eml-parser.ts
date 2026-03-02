import { simpleParser, type ParsedMail } from 'mailparser'
import { authenticate } from 'mailauth'

export interface EmlResult {
    from: string
    subject: string
    date: Date | null
    textContent: string
    dkimValid: boolean
    dkimDomain: string | null
    extractedAddresses: string[]
    extractedTxHashes: string[]
}

/**
 * Parse .eml file, verify DKIM signature, and extract blockchain-related data
 */
export async function parseAndVerifyEml(emlBuffer: Buffer): Promise<EmlResult> {
    // Parse email content
    const parsed: ParsedMail = await simpleParser(emlBuffer)

    const from = parsed.from?.value?.[0]?.address ?? ''
    const subject = parsed.subject ?? ''
    const date = parsed.date ?? null
    const htmlContent = parsed.html ? String(parsed.html).replace(/<[^>]*>/g, ' ') : ''
    const textContent = parsed.text ?? htmlContent

    // DKIM verification
    const authResult = await authenticate(emlBuffer, {} as Parameters<typeof authenticate>[1])

    const dkimResults = authResult.dkim?.results ?? []
    const dkimValid = dkimResults.some(
        (r: { status: { result: string } }) => r.status?.result === 'pass'
    )
    const dkimDomain = dkimResults.length > 0
        ? (dkimResults[0] as { signingDomain?: string }).signingDomain ?? null
        : null

    // Extract EVM addresses from text + HTML
    const addressRegex = /0x[a-fA-F0-9]{40}/g
    const addrSet = new Set<string>()
    for (const m of textContent.matchAll(addressRegex)) addrSet.add(m[0])
    // Also check raw HTML (addresses might be in links but not in plain text)
    const rawHtml = parsed.html ? String(parsed.html) : ''
    for (const m of rawHtml.matchAll(addressRegex)) addrSet.add(m[0])
    const extractedAddresses = [...addrSet]

    // Extract tx hashes from text + HTML
    const txHashes = new Set<string>()
    const searchIn = textContent + ' ' + rawHtml

    // 1. With 0x prefix: 0x + 64 hex chars
    for (const match of searchIn.matchAll(/0x[a-fA-F0-9]{64}/g)) {
        txHashes.add(match[0].toLowerCase())
    }

    // 2. Without 0x prefix: standalone 64 hex chars
    for (const match of searchIn.matchAll(/(?<![a-fA-F0-9])([a-fA-F0-9]{64})(?![a-fA-F0-9])/g)) {
        txHashes.add('0x' + match[1].toLowerCase())
    }

    const extractedTxHashes = [...txHashes]

    return {
        from,
        subject,
        date,
        textContent,
        dkimValid,
        dkimDomain,
        extractedAddresses,
        extractedTxHashes,
    }
}

/**
 * Known CEX email domains
 */
const CEX_EMAIL_DOMAINS: Record<string, string[]> = {
    'Binance': ['binance.com', 'post.binance.com', 'ses.binance.com'],
    'Coinbase': ['coinbase.com', 'cb.mail.coinbase.com'],
    'Kraken': ['kraken.com', 'e.kraken.com'],
    'Bybit': ['bybit.com', 'e.bybit.com'],
    'OKX': ['okx.com', 'okex.com'],
    'MEXC': ['mexc.com', 'mexcglobal.com'],
    'Gate.io': ['gate.io', 'gateio.com'],
    'KuCoin': ['kucoin.com'],
    'Bitget': ['bitget.com'],
    'HTX': ['htx.com', 'huobi.com'],
}

/**
 * Validate .eml content against wallet submission data
 *
 * Checks:
 * 1. DKIM signature valid
 * 2. Email sender domain matches the claimed CEX
 * 3. Wallet address found in email body (withdrawal destination)
 * 4. TX hash found in email body (optional, bonus verification)
 */
export function validateEmlAgainstSubmission(
    emlResult: EmlResult,
    walletAddress: string,
    fundingCexName: string,
    fundingTxHash: string | null,
): { valid: boolean, checks: { name: string, passed: boolean, detail: string }[] } {
    const checks: { name: string, passed: boolean, detail: string }[] = []

    // 1. DKIM
    checks.push({
        name: 'DKIM Signature',
        passed: emlResult.dkimValid,
        detail: emlResult.dkimValid
            ? `Valid (signed by ${emlResult.dkimDomain})`
            : 'Failed — email signature could not be verified',
    })

    // 2. Sender domain matches CEX
    const senderDomain = emlResult.from.split('@')[1]?.toLowerCase() ?? ''
    const expectedDomains = CEX_EMAIL_DOMAINS[fundingCexName] ?? []
    const domainMatch = expectedDomains.some(d => senderDomain.includes(d)) ||
        senderDomain.includes(fundingCexName.toLowerCase().replace(/\s/g, '').replace('.io', ''))

    checks.push({
        name: 'Sender Domain',
        passed: domainMatch,
        detail: domainMatch
            ? `${emlResult.from} matches ${fundingCexName}`
            : `${emlResult.from} does not match expected ${fundingCexName} domains`,
    })

    // 3. Wallet address in email body
    const addrLower = walletAddress.toLowerCase()
    const addressFound = emlResult.extractedAddresses.some(a => a.toLowerCase() === addrLower)

    checks.push({
        name: 'Wallet Address',
        passed: addressFound,
        detail: addressFound
            ? `Wallet ${walletAddress.slice(0, 10)}... found in email body`
            : 'Wallet address not found in email body',
    })

    // 4. TX hash in email body (REQUIRED)
    if (!fundingTxHash) {
        checks.push({
            name: 'Transaction Hash',
            passed: false,
            detail: 'No funding TX hash on record to verify against',
        })
    } else {
        const txFound = emlResult.extractedTxHashes.some(t => t.toLowerCase() === fundingTxHash.toLowerCase())
        checks.push({
            name: 'Transaction Hash',
            passed: txFound,
            detail: txFound
                ? 'Funding TX hash matches email content'
                : 'The original funding TX hash was not found in this email. Make sure you upload the email for the correct withdrawal.',
        })
    }

    const txPassed = checks.find(c => c.name === 'Transaction Hash')?.passed ?? false

    // ALL 3 must pass: DKIM + domain + address + tx hash
    const valid = emlResult.dkimValid && domainMatch && addressFound && txPassed

    return { valid, checks }
}
