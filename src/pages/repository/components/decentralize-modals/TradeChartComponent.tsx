import { ColorType, createChart } from 'lightweight-charts'
import React from 'react'

import { getTokenCurrentSupply } from '@/lib/bonding-curve/helpers'
import { Repo } from '@/types/repository'

import MarketStats from './MarketStats'

const styles = {
  backgroundColor: 'white',
  lineColor: 'white',
  textColor: 'black',
  areaTopColor: 'rgb(86 173 217)',
  areaBottomColor: 'rgba(86 173 217/0.28)',
  tooltipWrapper: {
    background: 'rgb(86 173 217)',
    border: 'none'
  },
  tooltip: {
    background: 'rgb(86 173 217)',
    color: 'rgb(86 173 217)'
  }
}

type ChartData = {
  time: string | number
  value: string | number
}

interface MarketStatsProps {
  marketCap: string
  volume: string
  circulatingSupply: string
  reserveBalance: string
}

export default function TradeChartComponent({
  data,
  repo,
  reserveBalance
}: {
  data: ChartData[]
  repo: Repo
  reserveBalance: string
}) {
  const [stats, setStats] = React.useState<MarketStatsProps>({
    marketCap: '0',
    volume: '0',
    circulatingSupply: '0',
    reserveBalance: '0'
  })
  const chartContainerRef = React.useRef<HTMLDivElement>(null)
  // React.useEffect(() => {
  //   if (!chartContainerRef.current) return
  //   setSize({
  //     width: chartContainerRef.current.clientWidth,
  //     height: chartContainerRef.current.clientHeight
  //   })
  // }, [chartContainerRef])

  React.useEffect(() => {
    fetchStats()
  }, [data, reserveBalance])

  async function fetchStats() {
    if (!repo?.token?.processId) return
    const stats = await getTokenCurrentSupply(repo?.token?.processId)

    const normalizedSupply = (Number(stats) / 10 ** +repo?.token?.denomination).toFixed(2)
    calculateMarketCap(reserveBalance, normalizedSupply)
  }

  function calculateMarketCap(reserves: string, currentSupply: string) {
    // Convert the string inputs to numbers
    const reservesAmount = parseFloat(reserves)
    const supplyAmount = parseFloat(currentSupply)

    // Ensure that currentSupply is not zero to avoid division by zero
    if (supplyAmount === 0 || reservesAmount === 0) {
      setStats({
        marketCap: '0',
        volume: '0',
        circulatingSupply: currentSupply,
        reserveBalance: reserveBalance
      })
    }

    // Calculate token price based on reserves and current supply
    const tokenPrice = reservesAmount / supplyAmount

    // Calculate market cap by multiplying token price with current supply
    const marketCap = (tokenPrice * supplyAmount).toFixed(2)

    setStats({
      marketCap: marketCap,
      volume: '0',
      circulatingSupply: currentSupply,
      reserveBalance: reserveBalance
    })
  }

  // function formatYAxis(value: number) {
  //   return value.toFixed(10)
  // }

  React.useEffect(() => {
    if (!chartContainerRef.current) return
    const handleResize = () => {
      if (!chartContainerRef.current) return

      chart.applyOptions({ width: chartContainerRef.current.clientWidth })
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: styles.backgroundColor },
        textColor: styles.textColor
      },
      grid: {
        vertLines: {
          color: '#eee'
        },
        horzLines: {
          color: '#eee'
        }
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: {
          bottom: 0
        }
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        // rightOffset: 0,
        fixRightEdge: true,
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false
      }
    })
    chart.timeScale().fitContent()

    const newSeries = chart.addAreaSeries({
      lineColor: styles.lineColor,
      topColor: styles.areaTopColor,
      bottomColor: styles.areaBottomColor,
      crosshairMarkerBackgroundColor: styles.tooltip.background,
      priceFormat: {
        type: 'price',
        precision: 12,
        minMove: 0.000001
      }
    })
    // const lineSeries = chart.addLineSeries({
    //   priceFormat: {
    //     type: 'price',
    //     precision: 12, // Number of decimal places to display
    //     minMove: 0.000001 // Minimum price movement
    //   }
    // })
    newSeries.setData(data as any)

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      chart.remove()
    }
  }, [data])

  return (
    <div className="h-full w-full flex flex-col gap-2">
      <div
        // ref={chartContainerRef}
        className="w-full h-full flex items-center bg-white rounded-lg overflow-hidden shadow-md justify-center relative"
      >
        {!data.length && (
          <div className="h-full absolute top-0 left-0 z-10 w-full bg-[rgba(245,245,245,0.2)] flex items-center justify-center">
            <h1 className="text-gray-500 text-3xl font-medium">No data</h1>
          </div>
        )}
        <div className="h-full w-full " ref={chartContainerRef} />
        {/* <AreaChart data={data} width={size.width} height={size.height} className="w-full h-full">
          <XAxis dataKey={'time'} />
          <YAxis allowDecimals domain={[0, 0.00000001]} orientation={'right'} tickFormatter={formatYAxis} />
          <Tooltip contentStyle={styles.tooltipWrapper} labelStyle={styles.tooltip} formatter={(value) => `${value}`} />
          <Area type={'natural'} dataKey="value" stroke="none" fillOpacity={0.5} fill="#77C6ED" />
        </AreaChart> */}
      </div>
      <MarketStats {...stats} />
    </div>
  )
}
