import {useEffect, useRef, useState} from 'react'
import {formatEther, parseEther} from 'viem'
import {useEERCContext} from '../context/EERCContext'
import {formatBalance, getExplorerUrl} from '../lib/utils'
import {useAccount, useBalance, useWriteContract} from 'wagmi'
import {erc20Abi} from 'viem'
import {TokenBatcher} from '../lib/batchReadCalls'
import {standardWatchOptions} from '../lib/wagmiConfig'

type OperationType = 'deposit' | 'withdraw'

export default function TokenOperations() {
    const {isConnected, chainId, tokenAddress, eerc, encryptedBalance, contractAddress, publicClient} = useEERCContext()
    const {address} = useAccount()
    const [amount, setAmount] = useState('')
    const [operationType, setOperationType] = useState<OperationType>('deposit')
    const [isProcessing, setIsProcessing] = useState(false)
    const [txHash, setTxHash] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [approvedAmount, setApprovedAmount] = useState<bigint>(0n)
    const [isApproving, setIsApproving] = useState(false)

    // Get regular token balance
    const {data: tokenBalanceData} = useBalance({
        address,
        token: tokenAddress as `0x${string}`,
        ...standardWatchOptions,
        query: {
            enabled: !!address && !!tokenAddress
        }
    })

    const isMainnet = chainId === 43114 // Avalanche mainnet chain ID

    const {writeContractAsync: approveTokens} = useWriteContract()

    // Create a TokenBatcher instance for efficient RPC calls
    const batcherRef = useRef<TokenBatcher | null>(null)

    // Initialize or update the batcher when dependencies change
    useEffect(() => {
        if (!publicClient || !tokenAddress || !contractAddress || !address) {
            batcherRef.current = null
            return
        }

        if (!batcherRef.current) {
            batcherRef.current = new TokenBatcher(
                publicClient,
                tokenAddress as `0x${string}`,
                contractAddress,
                address as `0x${string}`
            )
        } else {
            batcherRef.current.setUserAddress(address as `0x${string}`)
        }
    }, [publicClient, tokenAddress, contractAddress, address])

    // Fetch the current approval amount
    useEffect(() => {
        const fetchApproval = async () => {
            if (!batcherRef.current) return

            try {
                const allowance = await batcherRef.current.getAllowance()
                setApprovedAmount(allowance)
            } catch (error) {
                console.error('Error fetching token allowance:', error)
            }
        }

        fetchApproval()

        // Set up an interval to refresh the approval amount less frequently
        const intervalId = setInterval(fetchApproval, 15000) // Every 15 seconds

        return () => clearInterval(intervalId)
    }, [address, tokenAddress, contractAddress, publicClient, txHash])

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers and decimal point
        const value = e.target.value.replace(/[^0-9.]/g, '')
        setAmount(value)
    }

    const handleMaxClick = () => {
        if (operationType === 'deposit' && tokenBalanceData) {
            setAmount(tokenBalanceData.formatted)
        } else if (operationType === 'withdraw' && encryptedBalance) {
            setAmount(formatBalance(encryptedBalance.decryptedBalance))
        }
    }

    const handleApprove = async () => {
        if (!tokenAddress || !contractAddress || !amount) return

        setIsApproving(true)
        setError(null)

        try {
            const amountInWei = parseEther(amount)

            const result = await approveTokens({
                address: tokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: 'approve',
                args: [contractAddress, amountInWei],
            })

            setTxHash(result)

            // Wait for approval to be confirmed then update the approved amount
            setTimeout(async () => {
                try {
                    if (!batcherRef.current) return

                    // Force refresh of allowance after transaction
                    batcherRef.current.invalidateCache()
                    const allowance = await batcherRef.current.getAllowance(true)
                    setApprovedAmount(allowance)
                } catch (error) {
                    console.error('Error updating allowance after approval:', error)
                }
            }, 5000)

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
            setError(errorMessage)
            console.error('Approval error:', err)
        } finally {
            setIsApproving(false)
        }
    }

    const handleOperation = async () => {
        if (!encryptedBalance || !amount || isNaN(Number(amount))) return

        setIsProcessing(true)
        setError(null)
        setTxHash(null)

        try {
            const amountInWei = parseEther(amount)

            // Check if approval is needed for deposit - with fresh check
            if (operationType === 'deposit') {
                let currentApproval = approvedAmount;

                // Get latest approval if we have a batcher
                if (batcherRef.current) {
                    try {
                        currentApproval = await batcherRef.current.getAllowance(true);
                        setApprovedAmount(currentApproval); // Update UI with latest value
                    } catch (error) {
                        console.error('Error refreshing approval amount:', error);
                    }
                }

                if (currentApproval < amountInWei) {
                    setError('Insufficient approval. Please approve tokens first.')
                    setIsProcessing(false)
                    return
                }
            }

            let result

            if (operationType === 'deposit') {
                result = await encryptedBalance.deposit(amountInWei)
            } else {
                result = await encryptedBalance.withdraw(amountInWei)
            }

            setTxHash(result.transactionHash)

            // Refresh balance and allowance after 5 seconds
            setTimeout(() => {
                encryptedBalance.refetchBalance()

                // Also refresh allowance
                if (batcherRef.current) {
                    batcherRef.current.invalidateCache()
                    batcherRef.current.getAllowance(true).then(allowance => {
                        setApprovedAmount(allowance)
                    }).catch(error => {
                        console.error('Error refreshing allowance:', error)
                    })
                }
            }, 5000)

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
            setError(errorMessage)
            console.error(`${operationType} error:`, err)
        } finally {
            setIsProcessing(false)
        }
    }

    if (!isConnected) {
        return (
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Token Operations</h2>
                <p className="text-secondary-300">Please connect your wallet to use token operations.</p>
            </div>
        )
    }

    if (eerc && !eerc.isRegistered) {
        return (
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Token Operations</h2>
                <p className="text-secondary-300">You need to register before performing token operations.</p>
            </div>
        )
    }

    if (!eerc?.isInitialized || !encryptedBalance) {
        return (
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Token Operations</h2>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-secondary-700 rounded w-3/4"></div>
                    <div className="h-4 bg-secondary-700 rounded w-1/2"></div>
                </div>
                {import.meta.env.MODE !== 'production' && (
                    <div className="mt-4 text-xs text-red-400">
                        Status: {!eerc ? 'EERC not available' : !eerc.isInitialized ? 'EERC not initialized' : 'Balance not available'}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="card">
            <h2 className="text-xl font-bold mb-4">Token Operations</h2>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-secondary-400">Regular Token Balance:</p>
                        <p className="text-lg font-medium">
                            {tokenBalanceData ? `${tokenBalanceData.formatted} ${tokenBalanceData.symbol}` : '0 Tokens'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-secondary-400">Encrypted Balance:</p>
                        <p className="text-lg font-medium">
                            {formatBalance(encryptedBalance.decryptedBalance)} Tokens
                        </p>
                    </div>
                </div>

                <div className="flex rounded-md overflow-hidden border border-secondary-600">
                    <button
                        className={`flex-1 py-2 ${operationType === 'deposit' ? 'bg-primary-600 text-white' : 'bg-secondary-700 text-secondary-300'}`}
                        onClick={() => setOperationType('deposit')}
                    >
                        Deposit
                    </button>
                    <button
                        className={`flex-1 py-2 ${operationType === 'withdraw' ? 'bg-primary-600 text-white' : 'bg-secondary-700 text-secondary-300'}`}
                        onClick={() => setOperationType('withdraw')}
                    >
                        Withdraw
                    </button>
                </div>

                {operationType === 'deposit' && (
                    <div>
                        <p className="text-sm text-secondary-400">Approved Amount:</p>
                        <p className="text-sm font-medium">
                            {formatEther(approvedAmount)} Tokens
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-sm text-secondary-300 mb-1">
                        Amount
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0.0"
                            className="input w-full pr-16"
                        />
                        <button
                            onClick={handleMaxClick}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-secondary-600 px-2 py-1 rounded text-secondary-300 hover:bg-secondary-500"
                        >
                            MAX
                        </button>
                    </div>
                </div>

                {operationType === 'deposit' && amount && !isNaN(Number(amount)) && (
                    <>
                        {parseEther(amount) > approvedAmount ? (
                            <button
                                onClick={handleApprove}
                                disabled={isApproving}
                                className="btn btn-secondary w-full"
                            >
                                {isApproving ? 'Approving...' : 'Approve Tokens'}
                            </button>
                        ) : (
                            <button
                                onClick={handleOperation}
                                disabled={!amount || isNaN(Number(amount)) || isProcessing}
                                className="btn btn-primary w-full"
                            >
                                {isProcessing ? 'Processing...' : 'Deposit Tokens'}
                            </button>
                        )}
                        {parseEther(amount) > approvedAmount && (
                            <div className="mt-2 text-amber-400 text-sm">
                                You need to approve {amount} tokens before depositing
                            </div>
                        )}
                    </>
                )}

                {operationType === 'withdraw' && (
                    <button
                        onClick={handleOperation}
                        disabled={!amount || isNaN(Number(amount)) || isProcessing}
                        className="btn btn-primary w-full"
                    >
                        {isProcessing ? 'Processing...' : 'Withdraw Tokens'}
                    </button>
                )}

                {error && (
                    <div className="mt-2 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {txHash && (
                    <div className="mt-2">
                        <a
                            href={getExplorerUrl(txHash, isMainnet)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300 underline text-sm"
                        >
                            View transaction
                        </a>
                    </div>
                )}

                <div className="text-xs text-secondary-400">
                    <p className="mb-1"><strong>Deposit:</strong> Convert regular tokens to encrypted tokens.</p>
                    <p><strong>Withdraw:</strong> Convert encrypted tokens back to regular tokens.</p>
                </div>
            </div>
        </div>
    )
}