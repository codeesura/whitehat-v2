import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function PATCH(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { safe_wallet_address } = body

    // Validate Ethereum address format
    if (!safe_wallet_address || !ETH_ADDRESS_REGEX.test(safe_wallet_address)) {
        return NextResponse.json({
            error: 'Invalid Ethereum address. Must be 0x followed by 40 hex characters.',
        }, { status: 400 })
    }

    // Check cooldown: fetch current profile
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('safe_wallet_address, updated_at')
        .eq('id', user.id)
        .single()

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // If already has a safe wallet, enforce 3-day cooldown
    if (profile.safe_wallet_address) {
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
        .update({ safe_wallet_address })
        .eq('id', user.id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
