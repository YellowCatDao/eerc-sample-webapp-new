import {useState} from 'react'
import {useEERCContext} from '../context/EERCContext'
import {getExplorerUrl} from '../lib/utils'

export default function Register() {
    const {isConnected, chain, eerc} = useEERCContext()
    const [isRegistering, setIsRegistering] = useState(false)
    const [isGeneratingKey, setIsGeneratingKey] = useState(false)
    const [txHash, setTxHash] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [generatedKey, setGeneratedKey] = useState<string | null>(null)

    const isMainnet = chain?.id === 43114 // Avalanche mainnet chain ID

    const handleRegister = async () => {
        if (!eerc) return

        setIsRegistering(true)
        setError(null)

        try {
            const result = await eerc.register()
            setTxHash(result.transactionHash)
            setTimeout(() => {
                eerc.refetchEercUser()
            }, 5000) // Refetch user data after 5 seconds
        } catch (err) {
            console.error('Registration error:', err)
            setError(err instanceof Error ? err.message : 'An error occurred during registration')
        } finally {
            setIsRegistering(false)
        }
    }

    const handleGenerateKey = async () => {
        if (!eerc) return

        setIsGeneratingKey(true)
        setError(null)

        try {
            const key = await eerc.generateDecryptionKey()
            setGeneratedKey(key)
        } catch (err) {
            console.error('Error generating key:', err)
            setError(err instanceof Error ? err.message : 'An error occurred while generating key')
        } finally {
            setIsGeneratingKey(false)
        }
    }

    if (!isConnected) {
        return (
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Registration</h2>
                <p className="text-secondary-300">Please connect your wallet to register.</p>
            </div>
        )
    }

    if (!eerc) {
        return (
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Registration</h2>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-secondary-700 rounded w-3/4"></div>
                    <div className="h-4 bg-secondary-700 rounded w-1/2"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="card">
            <h2 className="text-xl font-bold mb-4">Registration</h2>

            <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                        <span className="text-secondary-300 mr-2">Status:</span>
                        <span
                            className={`px-2 py-0.5 text-sm rounded-full ${
                                eerc.isRegistered
                                    ? 'bg-green-900 text-green-300'
                                    : 'bg-amber-900 text-amber-300'
                            }`}
                        >
              {eerc.isRegistered ? 'Registered' : 'Not Registered'}
            </span>
                    </div>

                    {eerc.isRegistered && (
                        <>
                            <div className="flex items-center mt-2">
                                <span className="text-secondary-300 mr-2">Decryption Key:</span>
                                <span className={`text-sm ${generatedKey ? 'text-green-300' : 'text-red-300'}`}>
                  {generatedKey ? 'Set' : 'Not Set'}
                </span>
                            </div>

                            {!generatedKey && (
                                <button
                                    onClick={handleGenerateKey}
                                    disabled={isGeneratingKey}
                                    className="btn bg-amber-600 hover:bg-amber-700 text-white mt-2"
                                >
                                    {isGeneratingKey ? 'Generating...' : 'Generate Decryption Key'}
                                </button>
                            )}

                            {generatedKey && (
                                <div className="mt-2 p-3 bg-gray-800 rounded-md break-all">
                                    <p className="text-xs text-yellow-300 mb-1">Your decryption key (save this somewhere
                                        safe!):</p>
                                    <p className="text-xs font-mono">{generatedKey}</p>
                                </div>
                            )}
                        </>
                    )}

                    {!eerc.isRegistered && (
                        <button
                            onClick={handleRegister}
                            disabled={isRegistering || eerc.isRegistered}
                            className="btn btn-primary mt-2"
                        >
                            {isRegistering ? 'Registering...' : 'Register'}
                        </button>
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

                    {error && (
                        <div className="mt-2 text-red-400 text-sm">{error}</div>
                    )}
                </div>

                <div className="mt-4 text-xs text-secondary-400">
                    <p>
                        Registration is required to use the Encrypted ERC20 token. This creates a key pair that allows
                        you to send and receive encrypted tokens.
                    </p>
                </div>
            </div>
        </div>
    )
}