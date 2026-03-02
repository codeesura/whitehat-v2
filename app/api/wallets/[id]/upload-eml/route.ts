import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseAndVerifyEml, validateEmlAgainstSubmission } from '@/lib/eml-parser'
import { hybridEncrypt } from '@/lib/encryption'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch submission with funding data for cross-validation
    const { data: submission, error } = await supabase
        .from('wallet_submissions')
        .select('id, compromised_address, funding_tx_hash, funding_cex_name, status')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.status !== 'eml_required' && submission.status !== 'rejected') {
        return NextResponse.json({ error: 'EML upload is not available for this submission' }, { status: 400 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('eml') as File | null

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.eml')) {
        return NextResponse.json({ error: 'Only .eml files are accepted' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const emlBuffer = Buffer.from(arrayBuffer)

    try {
        // Parse .eml and verify DKIM
        const emlResult = await parseAndVerifyEml(emlBuffer)

        // Cross-validate against submission data
        const validation = validateEmlAgainstSubmission(
            emlResult,
            submission.compromised_address,
            submission.funding_cex_name ?? '',
            submission.funding_tx_hash,
        )

        if (!validation.valid) {
            // Find the first failed critical check for the rejection reason
            const failedChecks = validation.checks
                .filter(c => !c.passed)
                .map(c => `${c.name}: ${c.detail}`)

            await supabase
                .from('wallet_submissions')
                .update({
                    status: 'eml_required',
                    notes: `EML verification failed:\n${failedChecks.join('\n')}`,
                })
                .eq('id', id)

            return NextResponse.json({
                verified: false,
                error: 'Verification failed. Please make sure you uploaded the correct original withdrawal email.',
            }, { status: 400 })
        }

        // All checks passed — encrypt .eml and save
        const encryptedEml = hybridEncrypt(emlBuffer)

        await supabase
            .from('wallet_submissions')
            .update({
                encrypted_eml: encryptedEml,
                eml_verified: true,
                status: 'verified',
                notes: `EML verified:\n${validation.checks.map(c => `${c.passed ? 'PASS' : 'FAIL'} ${c.name}: ${c.detail}`).join('\n')}`,
            })
            .eq('id', id)

        return NextResponse.json({ verified: true })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'EML processing failed'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
