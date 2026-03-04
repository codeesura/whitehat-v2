import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAddress } from 'viem'

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
const COOLDOWN_DAYS = 3

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, handle, avatar_url, safe_wallet_address, created_at, updated_at')
        .eq('id', user.id)
        .single()

    if (error) {
        // PGRST116 = no rows found — new user without a profile row yet
        if (error.code === 'PGRST116') {
            return NextResponse.json({
                id: user.id,
                display_name: null,
                handle: null,
                avatar_url: null,
                safe_wallet_address: null,
                created_at: null,
                updated_at: null,
            })
        }
        console.error('Failed to fetch profile:', error.message)
        return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function PATCH(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { safe_wallet_address?: string }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    const { safe_wallet_address } = body

    // Validate Ethereum address format + EIP-55 checksum
    if (!safe_wallet_address || !ETH_ADDRESS_REGEX.test(safe_wallet_address)) {
        return NextResponse.json({
            error: 'Invalid Ethereum address. Must be 0x followed by 40 hex characters.',
        }, { status: 400 })
    }

    let checksumAddress: string
    try {
        checksumAddress = getAddress(safe_wallet_address)
    } catch {
        return NextResponse.json({
            error: 'Invalid Ethereum address checksum.',
        }, { status: 400 })
    }

    // Check cooldown: fetch current profile
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('safe_wallet_address, updated_at')
        .eq('id', user.id)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Failed to fetch profile for cooldown check:', fetchError.message)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // If already has a safe wallet, enforce 3-day cooldown
    if (profile?.safe_wallet_address) {
        const lastUpdate = new Date(profile.updated_at)
        const now = new Date()
        const diffDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)

        if (diffDays < COOLDOWN_DAYS) {
            const remainingHours = Math.ceil((COOLDOWN_DAYS - diffDays) * 24)
            return NextResponse.json({
                error: `Safe wallet can only be changed every ${COOLDOWN_DAYS} days. ${remainingHours}h remaining. For urgent changes, contact us.`,
            }, { status: 429 })
        }
    }

    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            safe_wallet_address: checksumAddress.toLowerCase(),
            updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select()
        .single()

    if (error) {
        console.error('Failed to upsert profile:', error.message)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json(data)
}
