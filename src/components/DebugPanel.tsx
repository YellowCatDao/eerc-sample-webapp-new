import {useEERCContext} from '../context/EERCContext'
import {displayFullAddress} from '../lib/utils'

export default function DebugPanel() {
    const {
        isConnected,
        network,
        contractAddress,
        tokenAddress,
        registrarAddress,
        eerc,
        encryptedBalance
    } = useEERCContext()

    if (!isConnected || !eerc) {
        return (
            <div className="card bg-secondary-900 border-amber-800">
                <h2 className="text-xl font-bold mb-4">Debug Information</h2>
                <p className="text-secondary-300">Connect your wallet to view debug information.</p>
            </div>
        )
    }

    return (
        <div className="card bg-secondary-900 border-amber-800">
            <h2 className="text-xl font-bold mb-4">Debug Information</h2>

            <div className="space-y-4 text-xs text-secondary-300">
                <div>
                    <h3 className="font-semibold text-amber-300 mb-1">Contract Addresses</h3>
                    <div className="grid grid-cols-1 gap-y-1">
                        <div className="grid grid-cols-3">
                            <span>EERC Contract:</span>
                            <span
                                className="col-span-2 font-mono break-all">{displayFullAddress(contractAddress)}</span>
                        </div>
                        <div className="grid grid-cols-3">
                            <span>Registrar Contract:</span>
                            <span
                                className="col-span-2 font-mono break-all">{displayFullAddress(registrarAddress)}</span>
                        </div>
                        <div className="grid grid-cols-3">
                            <span>Token Address:</span>
                            <span className="col-span-2 font-mono break-all">{displayFullAddress(tokenAddress)}</span>
                        </div>
                        <div className="grid grid-cols-3">
                            <span>Current Network:</span>
                            <span className="col-span-2">{network}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-amber-300 mb-1">EERC Status</h3>
                    <div className="grid grid-cols-1 gap-y-1">
                        <div className="grid grid-cols-3">
                            <span>Initialized:</span>
                            <span className="col-span-2">{eerc.isInitialized ? '✅' : '❌'}</span>
                        </div>
                        <div className="grid grid-cols-3">
                            <span>Registered:</span>
                            <span className="col-span-2">{eerc.isRegistered ? '✅' : '❌'}</span>
                        </div>
                        <div className="grid grid-cols-3">
                            <span>Is Converter:</span>
                            <span className="col-span-2">{eerc.isConverter ? '✅' : '❌'}</span>
                        </div>
                        <div className="grid grid-cols-3">
                            <span>All Data Fetched:</span>
                            <span className="col-span-2">{eerc.isAllDataFetched ? '✅' : '❌'}</span>
                        </div>
                        <div className="grid grid-cols-3">
                            <span>Auditor Key Set:</span>
                            <span className="col-span-2">{eerc.isAuditorKeySet ? '✅' : '❌'}</span>
                        </div>
                        {eerc.publicKey?.length > 0 && (
                            <div className="grid grid-cols-3">
                                <span>Your Public Key:</span>
                                <span className="col-span-2 break-all font-mono">
                  [{eerc.publicKey[0]?.toString() || ''}, {eerc.publicKey[1]?.toString() || ''}]
                </span>
                            </div>
                        )}
                    </div>
                </div>

                {encryptedBalance && (
                    <div>
                        <h3 className="font-semibold text-amber-300 mb-1">Encrypted Balance Details</h3>
                        <div className="grid grid-cols-1 gap-y-1">
                            <div className="grid grid-cols-3">
                                <span>Decrypted Balance:</span>
                                <span className="col-span-2">{encryptedBalance.decryptedBalance.toString()}</span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span>Parsed Balance:</span>
                                <span className="col-span-2">{encryptedBalance.parsedDecryptedBalance}</span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span>Decimals:</span>
                                <span className="col-span-2">{encryptedBalance.decimals?.toString() || '18'}</span>
                            </div>
                            {encryptedBalance.encryptedBalance?.length > 0 && (
                                <div className="grid grid-cols-3">
                                    <span>Encrypted Balance:</span>
                                    <div className="col-span-2 break-all font-mono">
                                        <div
                                            className="text-2xs">c1.x: {encryptedBalance.encryptedBalance[0]?.toString()}</div>
                                        <div
                                            className="text-2xs">c1.y: {encryptedBalance.encryptedBalance[1]?.toString()}</div>
                                        <div
                                            className="text-2xs">c2.x: {encryptedBalance.encryptedBalance[2]?.toString()}</div>
                                        <div
                                            className="text-2xs">c2.y: {encryptedBalance.encryptedBalance[3]?.toString()}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {eerc.auditorPublicKey?.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-amber-300 mb-1">Auditor Information</h3>
                        <div className="grid grid-cols-1 gap-y-1">
                            <div className="grid grid-cols-3">
                                <span>Auditor Address:</span>
                                <span
                                    className="col-span-2 font-mono break-all">{displayFullAddress(eerc.auditorAddress || '')}</span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span>Are You Auditor:</span>
                                <span className="col-span-2">{eerc.areYouAuditor ? '✅' : '❌'}</span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span>Auditor Public Key:</span>
                                <span className="col-span-2 break-all font-mono text-2xs">
                  [{eerc.auditorPublicKey[0]?.toString() || ''}, {eerc.auditorPublicKey[1]?.toString() || ''}]
                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Add tiny text class for very small text
const styleTag = document.createElement('style')
styleTag.innerHTML = `
  .text-2xs {
    font-size: 0.625rem;
    line-height: 0.75rem;
  }
`
document.head.appendChild(styleTag)