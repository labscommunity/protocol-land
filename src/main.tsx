import './index.css'

import { ArweaveWalletKit } from 'arweave-wallet-kit'
import ReactDOM from 'react-dom/client'

import App from './App.tsx'
import initializeGoogleAnalytics from './helpers/google-analytics/index.ts'

initializeGoogleAnalytics()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ArweaveWalletKit
    config={{
      permissions: ['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'ACCESS_PUBLIC_KEY', 'SIGNATURE', 'DISPATCH'],
      ensurePermissions: true
    }}
    theme={{
      displayTheme: 'light'
    }}
  >
    <App />
  </ArweaveWalletKit>
)
