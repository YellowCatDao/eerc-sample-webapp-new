import {createContext, ReactNode, useContext, useMemo} from 'react'
import {type Chain, useAccount, useNetwork, usePublicClient, useWalletClient} from 'wagmi'
import {
  MAINNET_EERC_ADDRESS,
  MAINNET_REGISTRAR_ADDRESS,
  MAINNET_TOKEN_ADDRESS,
  TESTNET_EERC_ADDRESS,
  TESTNET_REGISTRAR_ADDRESS,
  TESTNET_TOKEN_ADDRESS
} from '../constants/contracts'
import {useEERC} from '@avalabs/ac-eerc-sdk'
import {circuitURLs, wasmURLs} from '../config/zkFiles'

interface EERCContextType {
    isConnected: boolean
    chain: Chain | undefined
    network: 'mainnet' | 'testnet'
    contractAddress: `0x${string}`
    tokenAddress: string
    registrarAddress: string
    publicClient?: ReturnType<typeof usePublicClient>
    walletClient?: ReturnType<typeof useWalletClient>['data']
    eerc: any | null
    encryptedBalance: any | null
}

const EERCContext = createContext<EERCContextType>({
    isConnected: false,
    chain: undefined,
    network: 'testnet',
    contractAddress: '0x0000000000000000000000000000000000000000',
    tokenAddress: '',
    registrarAddress: '',
    eerc: null,
    encryptedBalance: null
})

interface EERCProviderProps {
    children: ReactNode
    network: 'mainnet' | 'testnet'
}

export function EERCProvider({children, network}: EERCProviderProps) {
    const {isConnected} = useAccount()
    const {chain} = useNetwork()
    const publicClient = usePublicClient()
    const {data: walletClient} = useWalletClient()

    // Choose appropriate contract addresses based on network
    const contractAddress = network === 'mainnet' ? MAINNET_EERC_ADDRESS : TESTNET_EERC_ADDRESS as `0x${string}`
    const registrarAddress = network === 'mainnet' ? MAINNET_REGISTRAR_ADDRESS : TESTNET_REGISTRAR_ADDRESS
    const tokenAddress = network === 'mainnet' ? MAINNET_TOKEN_ADDRESS : TESTNET_TOKEN_ADDRESS

    // Always call useEERC to preserve hook order, but provide proper parameters
    const eerc = useEERC(
        publicClient,
        walletClient as any, // Cast to any to avoid TS errors
        contractAddress,
        wasmURLs,
        circuitURLs
    );

    // Log debug info
    console.log("EERC Context Debug:", {
        initialized: eerc?.isInitialized,
        isConverter: eerc?.isConverter,
        connected: isConnected,
        hasWallet: !!walletClient,
        walletAccount: walletClient?.account?.address,
        hasTokenAddress: !!tokenAddress,
        hasEncryptedBalanceHook: !!eerc?.useEncryptedBalance,
        eerc: eerc ? Object.keys(eerc) : null,
        wasmURLs: wasmURLs,
        circuitURLs: circuitURLs ? Object.keys(circuitURLs) : null
    });

    // Use the encryptedBalance hook directly - this will continue to work
    // even when wallet isn't connected (though it will return meaningless data)
    const encryptedBalance = eerc?.useEncryptedBalance ? eerc.useEncryptedBalance(tokenAddress) : null;

    // Create the context value
    const value = useMemo(() => ({
        isConnected,
        chain,
        network,
        contractAddress,
        tokenAddress,
        registrarAddress,
        publicClient,
        walletClient,
        eerc,
        encryptedBalance
    }), [
        isConnected,
        chain,
        network,
        contractAddress,
        tokenAddress,
        registrarAddress,
        publicClient,
        walletClient,
        eerc,
        encryptedBalance
    ])

    return (
        <EERCContext.Provider value={value}>
            {children}
        </EERCContext.Provider>
    )
}

export function useEERCContext() {
    const context = useContext(EERCContext)
    if (!context) {
        throw new Error('useEERCContext must be used within an EERCProvider')
    }
    return context
}