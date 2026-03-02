import evmLabels from '@/all_evm_labels.json'

interface EvmLabel {
    address: string
    blockchain: string
    cex_name: string
}

export interface FundingResult {
    txHash: string
    fromAddress: string
    toAddress: string
    value: string
    timestamp: string
    chainId: string
    cexName: string | null
}

// Fallback CEX lookup from all_evm_labels.json
const cexLookup = new Map<string, string>()
for (const label of evmLabels as EvmLabel[]) {
    cexLookup.set(label.address.toLowerCase(), label.cex_name)
}

/**
 * Find the first native ETH funding TX across all EVM chains
 * Uses Routescan API — single request, all chains
 *
 * Returns: FundingResult if found, null if no funding, throws on API error
 */
export async function getFirstFundingTx(walletAddress: string): Promise<FundingResult | null> {
    const url = `https://cdn-canary.routescan.io/api/evm/all/address/${walletAddress}/internal-operations?ecosystem=all&count=false&limit=1&sort=asc`

    const res = await fetch(url)

    if (!res.ok) {
        throw new Error(`Routescan API error: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()

    if (!data.items || data.items.length === 0) return null

    const tx = data.items[0]
    const from = tx.from

    // Check CEX from Routescan labels
    let cexName: string | null = null
    if (from.dapp?.tags?.includes('cex')) {
        cexName = from.dapp.alias || from.owner || null
    }

    // Fallback: all_evm_labels.json
    if (!cexName && from.id) {
        cexName = cexLookup.get(from.id.toLowerCase()) ?? null
    }

    return {
        txHash: tx.txHash,
        fromAddress: from.id,
        toAddress: tx.to?.id ?? walletAddress,
        value: tx.value,
        timestamp: tx.timestamp,
        chainId: tx.chainId,
        cexName,
    }
}
