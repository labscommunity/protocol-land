import './index.css'

import OthentStrategy from '@arweave-wallet-kit/othent-strategy'
import ArConnectStrategy from '@arweave-wallet-kit-beta/arconnect-strategy'
import BrowserWalletStrategy from '@arweave-wallet-kit-beta/browser-wallet-strategy'
import { ArweaveWalletKit } from '@arweave-wallet-kit-beta/react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'

import App from './App.tsx'
import initializeGoogleAnalytics from './helpers/google-analytics/index.ts'
initializeGoogleAnalytics()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <ArweaveWalletKit
      config={{
        strategies: [new ArConnectStrategy(), new BrowserWalletStrategy(), new OthentStrategy()],
        permissions: [
          'ACCESS_ADDRESS',
          'SIGN_TRANSACTION',
          'ACCESS_PUBLIC_KEY',
          'SIGNATURE',
          'DISPATCH',
          'DECRYPT',
          'ENCRYPT'
        ],
        ensurePermissions: true
      }}
      theme={{
        displayTheme: 'light'
      }}
    >
      <App />
    </ArweaveWalletKit>
  </HelmetProvider>
)
