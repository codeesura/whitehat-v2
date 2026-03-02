import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encryptPrivateKey } from '@/lib/encryption'
import { ethers } from 'ethers'
import { getFirstFundingTx } from '@/lib/blockchain'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
        .from('wallet_submissions')
        .select('id, compromised_address, safe_wallet_address, funding_tx_hash, funding_cex_name, eml_verified, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { private_key } = body

    if (!private_key || typeof private_key !== 'string') {
        return NextResponse.json({ error: 'Private key is required' }, { status: 400 })
    }

    // Reject mnemonic phrases (contains spaces = seed phrase)
    if (private_key.trim().includes(' ')) {
        return NextResponse.json({
            error: 'Mnemonic/seed phrases are not accepted. Please enter your private key (64 hex characters).',
        }, { status: 400 })
    }

    // Normalize: add 0x prefix if missing
    const normalizedKey = private_key.startsWith('0x') ? private_key : `0x${private_key}`

    // Validate and derive address using ethers
    let wallet: ethers.Wallet
    try {
        wallet = new ethers.Wallet(normalizedKey)
    } catch {
        return NextResponse.json({
            error: 'Invalid private key. Only EVM private keys are accepted (0x + 64 hex characters).',
        }, { status: 400 })
    }

    const address = wallet.address

    // Get user's safe wallet address
    const { data: profile } = await supabase
        .from('profiles')
        .select('safe_wallet_address')
        .eq('id', user.id)
        .single()

    if (!profile?.safe_wallet_address) {
        return NextResponse.json({ error: 'Set a safe wallet address first' }, { status: 400 })
    }

    // Check if this address is already submitted by this user
    const { data: existing } = await supabase
        .from('wallet_submissions')
        .select('id')
        .eq('user_id', user.id)
        .eq('compromised_address', address.toLowerCase())
        .single()

    if (existing) {
        return NextResponse.json({ error: 'This wallet has already been submitted' }, { status: 409 })
    }

    // Encrypt private key with RSA
    const encryptedKey = encryptPrivateKey(normalizedKey)

    // Check first funding TX via Routescan
    let fundingTxHash: string | null = null
    let fundingCexName: string | null = null
    let notes: string | null = null
    let status = 'pending'

    try {
        const funding = await getFirstFundingTx(address.toLowerCase())
        if (funding) {
            fundingTxHash = funding.txHash
            fundingCexName = funding.cexName
            status = funding.cexName ? 'eml_required' : 'pending'
        }
    } catch (err) {
        notes = `Routescan error: ${err instanceof Error ? err.message : 'Unknown'}`
    }

    // Save to DB
    const { data, error } = await supabase
        .from('wallet_submissions')
        .insert({
            user_id: user.id,
            compromised_address: address.toLowerCase(),
            safe_wallet_address: profile.safe_wallet_address,
            encrypted_private_key: encryptedKey,
            funding_tx_hash: fundingTxHash,
            funding_cex_name: fundingCexName,
            notes,
            status,
        })
        .select('id, compromised_address, safe_wallet_address, funding_tx_hash, funding_cex_name, status, created_at')
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
