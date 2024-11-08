import React from 'react'

interface MarketStatsProps {
  marketCap: string
  volume: string
  circulatingSupply: string
}

const MarketStats: React.FC<MarketStatsProps> = ({ marketCap, volume, circulatingSupply }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full">
      <h2 className="text-lg font-semibold mb-4">Market Stats</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Market Cap</span>
          <span className="text-2xl font-bold">${marketCap}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">24h Volume</span>
          <span className="text-2xl font-bold">{volume}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Circulating Supply</span>
          <span className="text-2xl font-bold">{circulatingSupply}</span>
        </div>
      </div>
    </div>
  )
}

export default MarketStats
