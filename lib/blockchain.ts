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

// --- Lazy-load CEX lookup from GitHub ---
const EVM_LABELS_URL = 'https://raw.githubusercontent.com/codeesura/evm-labels/refs/heads/main/all_evm_labels.json'

let cexLookupCache: Map<string, string> | null = null
let cexLookupPromise: Promise<Map<string, string>> | null = null

async function getCexLookup(): Promise<Map<string, string>> {
    if (cexLookupCache) return cexLookupCache

    if (!cexLookupPromise) {
        cexLookupPromise = fetch(EVM_LABELS_URL, { next: { revalidate: 86400 } })
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch EVM labels: ${res.status}`)
                return res.json()
            })
            .then((labels: EvmLabel[]) => {
                const map = new Map<string, string>()
                for (const label of labels) {
                    map.set(label.address.toLowerCase(), label.cex_name)
                }
                cexLookupCache = map
                return map
            })
            .catch(err => {
                cexLookupPromise = null
                throw err
            })
    }

    return cexLookupPromise
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
    if (!tx || !tx.from) return null

    const from = typeof tx.from === 'string' ? { id: tx.from } : tx.from

    // Check CEX from Routescan labels
    let cexName: string | null = null
    if (from.dapp?.tags?.includes('cex')) {
        cexName = from.dapp.alias || from.owner || null
    }

    // Fallback: all_evm_labels.json (lazy-loaded)
    if (!cexName && from.id) {
        try {
            const lookup = await getCexLookup()
            cexName = lookup.get(from.id.toLowerCase()) ?? null
        } catch {
            // Labels unavailable — continue without fallback
        }
    }

    return {
        txHash: tx.txHash ?? '',
        fromAddress: from.id ?? '',
        toAddress: tx.to?.id ?? walletAddress,
        value: tx.value ?? '',
        timestamp: tx.timestamp ?? '',
        chainId: tx.chainId ?? '',
        cexName,
    }
}
