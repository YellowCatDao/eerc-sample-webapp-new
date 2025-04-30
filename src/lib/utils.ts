/**
 * Returns the full address without truncation
 */
export function displayFullAddress(address: string): string {
    return address || ''
}

/**
 * Formats a BigInt balance to a readable format with specified decimals
 */
export function formatBalance(balance: bigint | undefined, decimals: number = 18): string {
    if (!balance) return '0'

    const divisor = BigInt(10) ** BigInt(decimals)
    const integerPart = balance / divisor

    // Calculate fractional part
    const fractionalPart = balance % divisor
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0')

    // Remove trailing zeros
    let trimmedFractional = fractionalStr
    while (trimmedFractional.endsWith('0') && trimmedFractional.length > 0) {
        trimmedFractional = trimmedFractional.slice(0, -1)
    }

    if (trimmedFractional.length > 0) {
        return `${integerPart}.${trimmedFractional}`
    }

    return integerPart.toString()
}

/**
 * Returns the explorer URL for the given transaction hash
 */
export function getExplorerUrl(txHash: string, isMainnet: boolean): string {
    const baseUrl = isMainnet
        ? 'https://snowtrace.io'
        : 'https://testnet.snowtrace.io'

    return `${baseUrl}/tx/${txHash}`
}