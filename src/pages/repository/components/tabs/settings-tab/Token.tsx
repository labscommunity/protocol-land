import { useState } from 'react'

import BondingCurve from './components/token/BondingCurve'
import GenericToken from './components/token/GenericToken'

type TokenType = 'import' | 'bonding-curve'

export default function Token() {
  const [tokenType, setTokenType] = useState<TokenType>('import')

  return (
    <div className="flex flex-col gap-4 pb-40">
      <div className="w-full border-b-[1px] border-gray-200 py-1">
        <h1 className="text-2xl text-gray-900">Token Settings</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <input
            checked={tokenType === 'import'}
            onChange={() => setTokenType('import')}
            type="radio"
            id="import-token"
            name="token-type"
            value="import"
            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 checked:-primary-600"
          />
          <label htmlFor="import-token" className="ml-2 text-sm font-medium text-gray-600">
            Generic Token
          </label>
        </div>
        <div className="flex items-center">
          <input
            checked={tokenType === 'bonding-curve'}
            onChange={() => setTokenType('bonding-curve')}
            type="radio"
            id="bonding-curve"
            name="token-type"
            value="bonding-curve"
            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 checked:bg-primary-600"
          />
          <label htmlFor="bonding-curve" className="ml-2 text-sm font-medium text-gray-600">
            Bonding Curve Token
          </label>
        </div>
      </div>
      {tokenType === 'import' && <GenericToken />}
      {tokenType === 'bonding-curve' && <BondingCurve />}
    </div>
  )
}
