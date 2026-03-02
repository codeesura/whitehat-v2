import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseAndVerifyEml } from '@/lib/eml-parser'
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

    // Verify submission belongs to user and requires .eml
    const { data: submission, error } = await supabase
        .from('wallet_submissions')
        .select('id, status, funding_cex_name')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.status !== 'eml_required') {
        return NextResponse.json({ error: 'EML upload is not required for this submission' }, { status: 400 })
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

    // Read file
    const arrayBuffer = await file.arrayBuffer()
    const emlBuffer = Buffer.from(arrayBuffer)

    // Parse and verify DKIM
    try {
        const result = await parseAndVerifyEml(emlBuffer)

        if (!result.dkimValid) {
            await supabase
                .from('wallet_submissions')
                .update({
                    status: 'rejected',
                })
                .eq('id', id)

            return NextResponse.json({
                verified: false,
                error: 'DKIM signature verification failed. The email could not be authenticated.',
            }, { status: 400 })
        }

        // DKIM passed → encrypt .eml and save
        const encryptedEml = hybridEncrypt(emlBuffer)

        await supabase
            .from('wallet_submissions')
            .update({
                encrypted_eml: encryptedEml,
                eml_verified: true,
                status: 'verified',
            })
            .eq('id', id)

        return NextResponse.json({
            verified: true,
            from: result.from,
            subject: result.subject,
            dkimDomain: result.dkimDomain,
        })
    } catch (err) {
        const message = err instanceof Error ? err.message : 'EML processing failed'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
