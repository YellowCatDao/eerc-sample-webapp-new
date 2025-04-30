import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {WagmiConfig} from './context/WagmiContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <WagmiConfig>
            <App/>
        </WagmiConfig>
    </React.StrictMode>,
)