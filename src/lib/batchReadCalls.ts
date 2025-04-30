import {type PublicClient} from 'viem'
import {erc20ABI} from 'wagmi'

/**
 * Batching class for token operations
 */
export class TokenBatcher {
    private client: PublicClient
    private tokenAddress: `0x${string}`
    private contractAddress: `0x${string}`
    private userAddress: `0x${string}`

    // Cache for allowance and balance values
    private allowanceCache: {
        value: bigint | null;
        timestamp: number;
    } = {value: null, timestamp: 0}

    private balanceCache: {
        value: bigint | null;
        timestamp: number;
    } = {value: null, timestamp: 0}

    // Cache validity period (30 seconds)
    private CACHE_VALIDITY = 30000

    constructor(
        client: PublicClient,
        tokenAddress: `0x${string}`,
        contractAddress: `0x${string}`,
        userAddress: `0x${string}`
    ) {
        this.client = client
        this.tokenAddress = tokenAddress
        this.contractAddress = contractAddress
        this.userAddress = userAddress
    }

    /**
     * Updates user address when it changes
     */
    setUserAddress(address: `0x${string}`) {
        if (this.userAddress !== address) {
            // Clear cache when user changes
            this.allowanceCache = {value: null, timestamp: 0}
            this.balanceCache = {value: null, timestamp: 0}
            this.userAddress = address
        }
    }

    /**
     * Get token allowance with caching
     */
    async getAllowance(forceRefresh = false): Promise<bigint> {
        const now = Date.now()

        // Use cached value if available and still valid
        if (
            !forceRefresh &&
            this.allowanceCache.value !== null &&
            now - this.allowanceCache.timestamp < this.CACHE_VALIDITY
        ) {
            return this.allowanceCache.value
        }

        try {
            const allowance = await this.client.readContract({
                address: this.tokenAddress,
                abi: erc20ABI,
                functionName: 'allowance',
                args: [this.userAddress, this.contractAddress],
            }) as bigint;

            this.allowanceCache = {
                value: allowance,
                timestamp: now
            };

            return allowance;
        } catch (error) {
            console.error('Error fetching token allowance:', error)
            // Return the cached value if we have one, otherwise 0
            return this.allowanceCache.value ?? 0n
        }
    }

    /**
     * Get token balance with caching
     */
    async getBalance(forceRefresh = false): Promise<bigint> {
        const now = Date.now()

        // Use cached value if available and still valid
        if (
            !forceRefresh &&
            this.balanceCache.value !== null &&
            now - this.balanceCache.timestamp < this.CACHE_VALIDITY
        ) {
            return this.balanceCache.value
        }

        try {
            const balance = await this.client.readContract({
                address: this.tokenAddress,
                abi: erc20ABI,
                functionName: 'balanceOf',
                args: [this.userAddress],
            }) as bigint;

            this.balanceCache = {
                value: balance,
                timestamp: now
            };

            return balance;
        } catch (error) {
            console.error('Error fetching token balance:', error)
            // Return the cached value if we have one, otherwise 0
            return this.balanceCache.value ?? 0n
        }
    }

    /**
     * Invalidate all caches to force a refresh on next read
     */
    invalidateCache() {
        this.allowanceCache = {value: null, timestamp: 0}
        this.balanceCache = {value: null, timestamp: 0}
    }
}