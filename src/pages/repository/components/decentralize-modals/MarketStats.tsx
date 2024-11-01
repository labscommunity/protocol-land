import React from 'react'

import { getTokenCurrentSupply } from '@/lib/bonding-curve/helpers'
import { useGlobalStore } from '@/stores/globalStore'

interface MarketStatsProps {
  marketCap: string
  volume: string
  circulatingSupply: string
}

const MarketStats: React.FC = () => {
  const [repo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])
  const [stats, setStats] = React.useState<MarketStatsProps>({
    marketCap: '0',
    volume: '0',
    circulatingSupply: '0'
  })

  React.useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    if (!repo?.token?.processId) return
    const stats = await getTokenCurrentSupply(repo?.token?.processId)
    const normalizedSupply = (Number(stats) / 10 ** +repo?.token?.denomination).toFixed(2)
    setStats({
      marketCap: normalizedSupply,
      volume: '0',
      circulatingSupply: normalizedSupply
    })
  }
  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full">
      <h2 className="text-lg font-semibold mb-4">Market Stats</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Market Cap</span>
          <span className="text-2xl font-bold">${stats.marketCap}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">24h Volume</span>
          <span className="text-2xl font-bold">{stats.volume}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Circulating Supply</span>
          <span className="text-2xl font-bold">{stats.circulatingSupply}</span>
        </div>
      </div>
    </div>
  )
}

export default MarketStats
