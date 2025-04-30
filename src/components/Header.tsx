import {ConnectKitButton} from 'connectkit'
import {displayFullAddress} from '../lib/utils'

interface HeaderProps {
    network: 'mainnet' | 'testnet'
}

export default function Header({network}: HeaderProps) {

    return (
        <header className="bg-secondary-900 py-4 shadow-md">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold mr-2">EERC Token Dashboard</h1>
                    <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">
            {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
          </span>
                </div>

                <ConnectKitButton.Custom>
                    {({isConnected, isConnecting, show, address}) => {
                        return (
                            <button
                                onClick={show}
                                className="btn btn-primary font-mono text-xs overflow-hidden max-w-[300px] truncate"
                            >
                                {isConnected ? displayFullAddress(address || '') : isConnecting ? 'Connecting...' : 'Connect Wallet'}
                            </button>
                        )
                    }}
                </ConnectKitButton.Custom>
            </div>
        </header>
    )
}