import React from 'react'

import { formatNumberUsingNumeral } from '../../helpers/customFormatNumbers'

interface MarketStatsProps {
  marketCapUSD: string
  marketCap: string
  volume: string
  circulatingSupply: string
  baseTokenTicker: string
}

const MarketStats: React.FC<MarketStatsProps> = ({ marketCapUSD, marketCap, volume, circulatingSupply, baseTokenTicker }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full">
      <h2 className="text-lg font-semibold mb-4">Market Stats</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Market Cap (USD)</span>
          <span className="text-2xl font-bold">${marketCapUSD}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Market Cap ({baseTokenTicker})</span>
          <span className="text-2xl font-bold">{marketCap}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">24h Volume</span>
          <span className="text-2xl font-bold">{volume}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Circulating Supply</span>
          <span className="text-2xl font-bold uppercase">{formatNumberUsingNumeral(Number(circulatingSupply))}</span>
        </div>
      </div>
    </div>
  )
}

export default MarketStats
