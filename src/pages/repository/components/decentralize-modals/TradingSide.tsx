import React from 'react'

import { RepoToken } from '@/types/repository'

type Props = {
  handleTokenSwitch: () => void
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  selectedTokenToTransact: number
  tokenPair: RepoToken[]
  selectedToken: RepoToken
}

export default function TradingSide({
  handleTokenSwitch,
  handleAmountChange,
  selectedTokenToTransact,
  tokenPair,
  selectedToken
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Amount</label>
        <div className="flex items-center">
          <div
            onClick={handleTokenSwitch}
            className="text-sm px-2 py-1 cursor-pointer hover:bg-primary-700 rounded-md bg-primary-600 text-white"
          >
            Switch to ${selectedTokenToTransact === 0 ? tokenPair[1]?.tokenTicker : tokenPair[0]?.tokenTicker}
          </div>
        </div>
      </div>
      <div className="flex w-full relative items-center pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
        <input
          onChange={handleAmountChange}
          className="w-full focus:outline-none  px-3 flex-1"
          type="number"
          placeholder="0.00"
        />
        <div className="flex items-center gap-2">
          {selectedToken?.tokenTicker}
          {/* <img className="w-6 h-6 object-cover" src={imgUrlFormatter(selectedToken?.tokenImage || '')} /> */}
        </div>
      </div>
    </div>
  )
}
