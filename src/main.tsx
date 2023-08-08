import './index.css'

import { ArweaveWalletKit } from 'arweave-wallet-kit'
import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ArweaveWalletKit
      config={{
        permissions: ['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'ACCESS_PUBLIC_KEY', 'SIGNATURE'],
        ensurePermissions: true
      }}
      theme={{
        displayTheme: 'dark'
      }}
    >
      <App />
    </ArweaveWalletKit>
  </React.StrictMode>
)
