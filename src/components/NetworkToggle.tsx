interface NetworkToggleProps {
    network: 'mainnet' | 'testnet'
    onToggle: () => void
}

export default function NetworkToggle({network, onToggle}: NetworkToggleProps) {
    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm text-secondary-400">Network:</span>
            <button
                onClick={onToggle}
                className="bg-secondary-700 rounded-full px-3 py-1 text-sm font-medium flex items-center"
            >
        <span
            className={`inline-block h-2 w-2 rounded-full mr-2 ${network === 'mainnet' ? 'bg-green-500' : 'bg-yellow-500'}`}
        />
                {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
            </button>
        </div>
    )
}