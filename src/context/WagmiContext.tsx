import {createConfig, WagmiProvider} from 'wagmi'
import {ConnectKitProvider, getDefaultConfig} from 'connectkit'
import {avalanche, avalancheFuji} from 'wagmi/chains'
import {ReactNode} from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'

// Define the chains we want to support
const chains = [avalanche, avalancheFuji] as const

// Create the wagmi config
const config = createConfig(
    getDefaultConfig({
        appName: 'EERC Token Web App',
        // You should replace this with your project ID from WalletConnect
        // https://cloud.walletconnect.com/
        walletConnectProjectId: '928996a562ebd502c7b97128dccf0e74',
        chains,
    })
)

interface WagmiConfigProps {
    children: ReactNode
}

const queryClient = new QueryClient()

export function WagmiConfig({children}: WagmiConfigProps) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider mode="dark">
                    {children}
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}