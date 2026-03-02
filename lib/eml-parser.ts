import { simpleParser, type ParsedMail } from 'mailparser'
import { authenticate } from 'mailauth'

export interface EmlResult {
    from: string
    subject: string
    date: Date | null
    dkimValid: boolean
    dkimDomain: string | null
}

/**
 * Parse .eml file and verify DKIM signature
 */
export async function parseAndVerifyEml(emlBuffer: Buffer): Promise<EmlResult> {
    // Parse email content
    const parsed: ParsedMail = await simpleParser(emlBuffer)

    const from = parsed.from?.value?.[0]?.address ?? ''
    const subject = parsed.subject ?? ''
    const date = parsed.date ?? null

    // DKIM verification
    const authResult = await authenticate(emlBuffer, {} as Parameters<typeof authenticate>[1])

    const dkimResults = authResult.dkim?.results ?? []
    const dkimValid = dkimResults.some(
        (r: { status: { result: string } }) => r.status?.result === 'pass'
    )
    const dkimDomain = dkimResults.length > 0
        ? (dkimResults[0] as { signingDomain?: string }).signingDomain ?? null
        : null

    return { from, subject, date, dkimValid, dkimDomain }
}
