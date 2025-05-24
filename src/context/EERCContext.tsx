import {createContext, ReactNode, useContext, useMemo} from 'react'
import {useAccount, useChainId, usePublicClient, useWalletClient} from 'wagmi'
import {
  MAINNET_EERC_ADDRESS,
  MAINNET_REGISTRAR_ADDRESS,
  MAINNET_TOKEN_ADDRESS,
  TESTNET_EERC_ADDRESS,
  TESTNET_REGISTRAR_ADDRESS,
  TESTNET_TOKEN_ADDRESS
} from '../constants/contracts'
import {useEERC} from '@avalabs/eerc-sdk-next'
import {circuitURLs, wasmURLs} from '../config/zkFiles'

interface EERCContextType {
    isConnected: boolean
    chainId: number | undefined
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
    chainId: undefined,
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
    const chainId = useChainId()
    const publicClient = usePublicClient()
    const {data: walletClient} = useWalletClient()

    // Choose appropriate contract addresses based on network
    const contractAddress = network === 'mainnet' ? MAINNET_EERC_ADDRESS : TESTNET_EERC_ADDRESS as `0x${string}`
    const registrarAddress = network === 'mainnet' ? MAINNET_REGISTRAR_ADDRESS : TESTNET_REGISTRAR_ADDRESS
    const tokenAddress = network === 'mainnet' ? MAINNET_TOKEN_ADDRESS : TESTNET_TOKEN_ADDRESS

    // Always call useEERC to preserve hook order, but provide proper parameters
    const eerc = useEERC(
        publicClient as any,
        walletClient as any,
        contractAddress,
        wasmURLs,
    );

    // Log debug info
    // Use the encryptedBalance hook directly - this will continue to work
    // even when wallet isn't connected (though it will return meaningless data)
    const encryptedBalance = eerc.useEncryptedBalance(tokenAddress);

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


    // Create the context value
    const value = useMemo(() => ({
        isConnected,
        chainId,
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
        chainId,
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