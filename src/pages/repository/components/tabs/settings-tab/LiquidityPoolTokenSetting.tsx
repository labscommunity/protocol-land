import React, { useState } from 'react'

import { Button } from '@/components/common/buttons'
import { checkLiquidityPoolReserves } from '@/lib/bark'
import { fetchTokenInfo } from '@/lib/decentralize'

export default function LiquidityPoolTokenSetting({ poolId }: { poolId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reserves, setReserves] = useState({
    tokenA: {
      ticker: '',
      amount: 0
    },
    tokenB: {
      ticker: '',
      amount: 0
    }
  })

  React.useEffect(() => {
    fetchReserves()
  }, [poolId])

  async function fetchReserves() {
    if (!isLoading) {
      setIsLoading(true)
    }

    try {
      // if pool exists, get reserves
      const reserves = await checkLiquidityPoolReserves(poolId)

      if (!reserves) {
        setError('Liquidity pool does not exist.')

        return
      }

      const tokens = Object.keys(reserves || {})

      if (tokens.length !== 2) {
        setError('Liquidity pool corrupted.')

        return
      }

      const tokenA = await fetchTokenInfo(tokens[0])
      const tokenB = await fetchTokenInfo(tokens[1])

      if (!tokenA || !tokenB) {
        setError('Failed to fetch token info.')

        return
      }

      setReserves({
        tokenA: {
          ticker: tokenA?.tokenTicker || '',
          amount: parseFloat(reserves[tokens[0]]) / 10 ** Number(tokenA?.denomination)
        },
        tokenB: {
          ticker: tokenB?.tokenTicker || '',
          amount: parseFloat(reserves[tokens[1]]) / 10 ** Number(tokenB?.denomination)
        }
      })

      // query token info for ticker
      // set reserves
    } catch (error) {
      setError('Failed to fetch reserves.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-col mt-4 gap-1">
      <h1 className="text-sm font-medium text-gray-600 mb-1">Reserves</h1>
      {!isLoading && !error && (
        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium">{reserves.tokenA.ticker}</h3>
            <p className="text-base text-gray-600">{reserves.tokenA.amount}</p>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium">{reserves.tokenB.ticker}</h3>
            <p className="text-base text-gray-600">{reserves.tokenB.amount}</p>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="flex gap-8">
          <LoadingBox />
          <LoadingBox />
        </div>
      )}
      {error && !isLoading && (
        <div className="flex gap-2 w-fit items-center">
          <p className="text-red-500 text-sm font-medium">{error}</p>
          <Button variant="primary-outline" className="w-fit h-6 text-sm rounded-md" onClick={() => fetchReserves()}>
            Retry
          </Button>
        </div>
      )}
    </div>
  )
}

function LoadingBox() {
  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="h-3 rounded-full w-24 animate-pulse bg-gray-300" />
      <div className="rounded-full h-3 w-24 animate-pulse bg-gray-300" />
    </div>
  )
}
