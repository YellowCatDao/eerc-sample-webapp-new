import {useState} from 'react'
import Footer from './components/Footer'
import Header from './components/Header'
import NetworkToggle from './components/NetworkToggle'
import Register from './components/Register'
import TokenOperations from './components/TokenOperations'
import TokenTransfer from './components/TokenTransfer'
import DebugPanel from './components/DebugPanel'
import {EERCProvider} from './context/EERCContext'

function App() {
    const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet')

    return (
        <div className="min-h-screen flex flex-col">
            <Header network={network}/>

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-8 flex justify-end">
                    <NetworkToggle
                        network={network}
                        onToggle={() => setNetwork(network === 'mainnet' ? 'testnet' : 'mainnet')}
                    />
                </div>

                <EERCProvider network={network}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <Register/>
                            <TokenOperations/>
                        </div>
                        <div className="space-y-8">
                            <TokenTransfer/>
                            <DebugPanel/>
                        </div>
                    </div>
                </EERCProvider>
            </main>

            <Footer/>
        </div>
    )
}

export default App