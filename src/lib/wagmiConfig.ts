/**
 * Configuration options for wagmi hooks to optimize RPC usage
 */

/**
 * Configuration for regular watch parameters that updates at a reasonable interval
 * Used for things like balances and other frequently changing data
 */
export const standardWatchOptions = {
    watch: true,
    // If you need to specify a custom poll interval, you can use this:
    // This increases the default 4s poll interval to 15s
    pollingInterval: 15000,
}

