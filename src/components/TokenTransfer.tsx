import {useState} from 'react'
import {parseEther} from 'viem'
import {useEERCContext} from '../context/EERCContext'
import {formatBalance, getExplorerUrl} from '../lib/utils'

export default function TokenTransfer() {
    const {isConnected, chain, eerc, encryptedBalance} = useEERCContext()
    const [recipient, setRecipient] = useState('')
    const [amount, setAmount] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [txHash, setTxHash] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [recipientStatus, setRecipientStatus] = useState<{ isChecking: boolean, isRegistered: boolean | null }>({
        isChecking: false,
        isRegistered: null
    })

    const isMainnet = chain?.id === 43114 // Avalanche mainnet chain ID

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers and decimal point
        const value = e.target.value.replace(/[^0-9.]/g, '')
        setAmount(value)
    }

    const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const address = e.target.value
        setRecipient(address)

        // Reset the status when the address changes
        setRecipientStatus({
            isChecking: false,
            isRegistered: null
        })
    }

    const handleMaxClick = () => {
        if (!encryptedBalance) return
        setAmount(formatBalance(encryptedBalance.decryptedBalance))
    }

    const isValidEthereumAddress = (address: string) => {
        return /^0x[a-fA-F0-9]{40}$/.test(address)
    }

    const checkRecipientRegistered = async () => {
        if (!isValidEthereumAddress(recipient) || !eerc) return

        setRecipientStatus({
            isChecking: true,
            isRegistered: null
        })

        try {
            const {isRegistered} = await eerc.isAddressRegistered(recipient as `0x${string}`)
            setRecipientStatus({
                isChecking: false,
                isRegistered
            })
        } catch (err) {
            console.error('Error checking recipient status:', err)
            setRecipientStatus({
                isChecking: false,
                isRegistered: false
            })
        }
    }

    const handleTransfer = async () => {
        if (!encryptedBalance || !amount || isNaN(Number(amount))) return
        if (!isValidEthereumAddress(recipient)) {
            setError('Invalid recipient address')
            return
        }

        if (recipientStatus.isRegistered === false) {
            setError('Recipient is not registered for encrypted transfers')
            return
        }

        setIsProcessing(true)
        setError(null)
        setTxHash(null)

        try {
            const amountInWei = parseEther(amount)
            const result = await encryptedBalance.privateTransfer(recipient, amountInWei)

            setTxHash(result.transactionHash)

            // Refresh balance after transfer
            setTimeout(() => {
                encryptedBalance.refetchBalance()
            }, 5000)

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
            setError(errorMessage)
            console.error('Transfer error:', err)
        } finally {
            setIsProcessing(false)
        }
    }

    if (!isConnected) {
        return (
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Transfer Tokens</h2>
                <p className="text-secondary-300">Please connect your wallet to transfer tokens.</p>
            </div>
        )
    }

    if (!eerc?.isRegistered) {
        return (
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Transfer Tokens</h2>
                <p className="text-secondary-300">You need to register before transferring tokens.</p>
            </div>
        )
    }

    if (!eerc.isInitialized || !encryptedBalance) {
        return (
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Transfer Tokens</h2>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-secondary-700 rounded w-3/4"></div>
                    <div className="h-4 bg-secondary-700 rounded w-1/2"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="card">
            <h2 className="text-xl font-bold mb-4">Transfer Tokens</h2>

            <div className="space-y-6">
                <div>
                    <p className="text-sm text-secondary-400">Available Balance:</p>
                    <p className="text-lg font-medium">
                        {formatBalance(encryptedBalance.decryptedBalance)} Tokens
                    </p>
                </div>

                <div>
                    <label className="block text-sm text-secondary-300 mb-1">
                        Recipient Address
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={recipient}
                            onChange={handleRecipientChange}
                            placeholder="0x..."
                            className="input w-full"
                        />
                        {isValidEthereumAddress(recipient) && recipientStatus.isRegistered === null && (
                            <button
                                onClick={checkRecipientRegistered}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-secondary-600 px-2 py-1 rounded text-secondary-300 hover:bg-secondary-500"
                            >
                                Verify
                            </button>
                        )}
                    </div>

                    {recipient && !isValidEthereumAddress(recipient) && (
                        <p className="mt-1 text-red-400 text-xs">
                            Please enter a valid Ethereum address
                        </p>
                    )}

                    {recipientStatus.isChecking && (
                        <p className="mt-1 text-secondary-400 text-xs">
                            Checking if recipient is registered...
                        </p>
                    )}

                    {recipientStatus.isRegistered !== null && !recipientStatus.isChecking && (
                        <p className={`mt-1 text-xs ${recipientStatus.isRegistered ? 'text-green-400' : 'text-red-400'}`}>
                            {recipientStatus.isRegistered
                                ? 'Recipient is registered ✓'
                                : 'Recipient is not registered ✗'}
                        </p>
                    )}
                </div>

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

                <button
                    onClick={handleTransfer}
                    disabled={
                        !amount ||
                        isNaN(Number(amount)) ||
                        !isValidEthereumAddress(recipient) ||
                        isProcessing ||
                        recipientStatus.isRegistered === false
                    }
                    className="btn btn-primary w-full"
                >
                    {isProcessing ? 'Processing...' : 'Transfer Tokens'}
                </button>

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

                <div className="mt-4 p-4 bg-secondary-700 rounded-md">
                    <h3 className="text-sm font-medium text-secondary-200 mb-2">About Encrypted Transfers</h3>
                    <p className="text-xs text-secondary-400">
                        Encrypted transfers allow you to send tokens privately. The transaction is recorded on the
                        blockchain, but the amount is encrypted and can only be seen by the sender, recipient,
                        and authorized auditors. The transfer is secured using zero-knowledge proofs.
                    </p>
                </div>
            </div>
        </div>
    )
}