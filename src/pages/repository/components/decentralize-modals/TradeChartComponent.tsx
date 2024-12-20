import BigNumber from 'bignumber.js'
// import { ColorType, createChart } from 'lightweight-charts'
import Chart from 'chart.js/auto'
import numeral from 'numeral'
import React from 'react'
import { BeatLoader } from 'react-spinners'

import { getCurrentStep, getTokenNextBuyPrice } from '@/lib/bonding-curve'
import { getTokenCurrentSupply } from '@/lib/bonding-curve/helpers'
import { CurveStep } from '@/lib/discrete-bonding-curve/curve'
import { customFormatNumber, formatNumberUsingNumeral } from '@/pages/repository/helpers/customFormatNumbers'
import { CurveState } from '@/stores/repository-core/types'
import { Repo } from '@/types/repository'

import MarketStats from './MarketStats'

const highlightPlugin = {
  id: 'highlight',
  beforeDraw: function (chart: any) {
    // @ts-ignore
    if (chart?.tooltip?._active && Array.isArray(chart.tooltip._active) && chart.tooltip._active.length) {
      // Get the current point and the next point
      const activePoint = chart.tooltip._active[0]
      const currentIndex = activePoint.index
      const currentPoint = activePoint.element
      const nextPoint = chart.getDatasetMeta(0).data[currentIndex + 1]
      // @ts-ignore
      if (!nextPoint) return

      const ctx = chart.ctx
      const x = currentPoint.x
      const nextX = nextPoint.x
      const yAxis = chart.scales.y
      ctx.save()
      ctx.fillStyle = 'rgba(6, 182, 212, 0.2)'
      ctx.fillRect(x, yAxis.top, nextX - x, yAxis.bottom - yAxis.top)
      ctx.restore()
    }
  }
}
Chart.register(highlightPlugin)
type ChartData = {
  time: string | number
  value: string | number
}

interface MarketStatsProps {
  marketCap: string
  volume: string
  circulatingSupply: string
}

export default function TradeChartComponent({
  data,
  repo,
  reserveBalance,
  curveState,
  repoTokenBuyAmount
}: {
  data: ChartData[]
  repo: Repo
  reserveBalance: string
  curveState: CurveState
  repoTokenBuyAmount: string
}) {
  const [currentStep, setCurrentStep] = React.useState<number>(0)
  const [isFetchingNextPrice, setIsFetchingNextPrice] = React.useState<boolean>(false)
  const [nextPrice, setNextPrice] = React.useState<string>('0')
  const [baseAssetPriceUSD, setBaseAssetPriceUSD] = React.useState<string>('0')
  const [priceInUSD, setPriceInUSD] = React.useState<string>('0')
  const [stats, setStats] = React.useState<MarketStatsProps>({
    marketCap: '0',
    volume: '0',
    circulatingSupply: '0'
  })

  const [curveStepsCache, setCurveStepsCache] = React.useState<{ rangeTo: number; price: number }[]>([])
  const [currentSupply, setCurrentSupply] = React.useState<{ rangeTo: number; price: number }>({ rangeTo: 0, price: 0 })
  const [afterTradeSupply, setAfterTradeSupply] = React.useState<{ rangeTo: number; price: number }>({
    rangeTo: 0,
    price: 0
  })

  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const chart = React.useRef<Chart<'line' | 'scatter', CurveStep[], unknown> | null>(null)
  console.log({ currentStep })
  // React.useEffect(() => {
  //   if (!chartContainerRef.current) return
  //   setSize({
  //     width: chartContainerRef.current.clientWidth,
  //     height: chartContainerRef.current.clientHeight
  //   })
  // }, [chartContainerRef])

  React.useEffect(() => {
    if (!curveState) return
    const interval = setInterval(fetchNextPrice, 15000)
    return () => clearInterval(interval)
  }, [curveState])

  React.useEffect(() => {
    if (!curveState) return
    fetchStats()
  }, [data, reserveBalance, curveState])

  React.useEffect(() => {
    if (!curveStepsCache || !stats?.circulatingSupply) return
    const point = curveStepsCache.find((step) => Number(stats.circulatingSupply) <= step.rangeTo)
    console.log('currentPoint: ', { rangeTo: Number(stats.circulatingSupply), price: point ? point.price : 0 })

    setCurrentSupply({ rangeTo: Number(stats.circulatingSupply), price: point ? point.price : 0 })
  }, [curveStepsCache, stats])

  React.useEffect(() => {
    if (!curveStepsCache || !stats?.circulatingSupply) return
    const point = curveStepsCache.find(
      (step) => Number(stats.circulatingSupply) + Number(repoTokenBuyAmount) <= step.rangeTo
    )
    console.log('afterBuyPoint: ', {
      rangeTo: Number(stats.circulatingSupply) + Number(repoTokenBuyAmount),
      price: point ? point.price : 0
    })

    setAfterTradeSupply({
      rangeTo: Number(stats.circulatingSupply) + Number(repoTokenBuyAmount),
      price: point ? point.price : 0
    })
  }, [curveStepsCache, repoTokenBuyAmount, stats])

  React.useEffect(() => {
    if (!chart.current) return
    chart.current.data.datasets[1].data = [currentSupply]
    chart.current?.update()
  }, [currentSupply])
  React.useEffect(() => {
    if (!chart.current) return
    chart.current.data.datasets[2].data = [afterTradeSupply]
    chart.current?.update()
  }, [afterTradeSupply])

  async function fetchStats() {
    if (!repo?.token?.processId) return
    const supply = await getTokenCurrentSupply(repo?.token?.processId)

    const normalizedSupply = BigNumber(supply)
      .dividedBy(BigNumber(10).pow(BigNumber(repo?.token?.denomination)))
      .toString()
    const nextPrice = await getTokenNextBuyPrice(supply, curveState)
    const nextPriceFormatted = BigNumber(nextPrice)
      .dividedBy(BigNumber(10).pow(BigNumber(curveState.reserveToken.denomination)))
      .toString()

    setNextPrice(nextPriceFormatted)

    const marketCap = BigNumber(nextPriceFormatted).multipliedBy(BigNumber(normalizedSupply)).toString()

    setStats({
      marketCap: marketCap,
      volume: '0',
      circulatingSupply: normalizedSupply
    })

    console.log('Normalized supply: ', normalizedSupply)
  }

  React.useEffect(() => {
    if (!curveState || !chart.current) return
    setTimeout(() => {
      chart.current?.update()
    }, 100)
  }, [stats])

  async function fetchNextPrice() {
    if (!curveState || !curveState.repoToken?.processId) return
    setIsFetchingNextPrice(true)
    const currentSupply = await getTokenCurrentSupply(curveState.repoToken.processId)

    const nextPrice = await getTokenNextBuyPrice(currentSupply, curveState)
    setNextPrice(
      BigNumber(nextPrice)
        .dividedBy(BigNumber(10).pow(BigNumber(curveState.reserveToken.denomination)))
        .toString()
    )
    setIsFetchingNextPrice(false)

    const step = await getCurrentStep(currentSupply, curveState.steps)
    setCurrentStep(step)
  }

  // function formatYAxis(value: number) {
  //   return value.toFixed(10)
  // }

  React.useEffect(() => {
    if (!curveState?.steps) return
    initializeChart(curveState.steps)
  }, [curveState, chart, stats])

  React.useEffect(() => {
    if (!curveState?.reserveToken || !+nextPrice) return
    fetchBaseAssetPriceUSD()
  }, [curveState, nextPrice])

  React.useEffect(() => {
    if (!baseAssetPriceUSD || !+baseAssetPriceUSD || !+nextPrice) return

    // Convert nextPrice from AR to USD by multiplying AR price by USD/AR rate
    const priceInUSD = BigNumber(nextPrice)
      .multipliedBy(BigNumber(baseAssetPriceUSD))
      // .dividedBy(BigNumber(10).pow(BigNumber(repo?.token!.denomination)))
      .toString()

    setPriceInUSD(priceInUSD)
  }, [baseAssetPriceUSD, nextPrice])

  async function fetchBaseAssetPriceUSD() {
    if (!curveState?.reserveToken) return
    const token = curveState.reserveToken

    if (token.tokenTicker === 'TUSDA') {
      setBaseAssetPriceUSD('24')

      return
    }

    try {
      const response = await fetch('https://api.redstone.finance/prices?symbol=AR&provider=redstone-rapid&limit=1')
      const data = await response.json()
      setBaseAssetPriceUSD(data[0].value.toString())
    } catch (error) {
      console.error('Failed to fetch AR price:', error)
      setBaseAssetPriceUSD('0')
    }
  }

  function initializeChart(steps: CurveStep[]) {
    if (!curveState?.repoToken) return
    const curveSteps = steps.map((step) => ({
      rangeTo: BigNumber(step.rangeTo / 10 ** +curveState.repoToken.denomination).toNumber(),
      price: BigNumber(step.price / 10 ** +curveState.reserveToken.denomination).toNumber()
    }))
    setCurveStepsCache(curveSteps)
    const ctx = canvasRef.current
    if (!ctx) return

    let _chart: Chart<'line' | 'scatter', CurveStep[], unknown> | null = chart.current
    if (!_chart) {
      const lineColor = '#06b6d4'
      const currentColor = 'blue'
      const afterBuyColor = 'green'
      _chart = new Chart(ctx, {
        data: {
          datasets: [
            {
              type: 'line',
              label: 'Price',
              data: curveSteps,
              borderColor: lineColor,
              backgroundColor: 'transparent',
              borderWidth: 1,
              pointBackgroundColor: lineColor,
              stepped: 'before',
              fill: true,
              parsing: {
                xAxisKey: 'rangeTo', // Use 'rangeTo' as the x-axis value
                yAxisKey: 'price' // Use 'price' as the y-axis value
              },
              order: 3
            },
            {
              label: 'Current Supply',
              data: [],
              borderColor: currentColor,
              backgroundColor: 'transparent',
              pointRadius: 6,
              borderWidth: 2,
              type: 'scatter',
              parsing: {
                xAxisKey: 'rangeTo', // Use 'rangeTo' as the x-axis value
                yAxisKey: 'price' // Use 'price' as the y-axis value
              },
              order: 1
            },
            {
              label: 'After Buy Supply',
              data: [],
              borderColor: afterBuyColor,
              backgroundColor: 'transparent',
              pointRadius: 6,
              borderWidth: 2,
              type: 'scatter',
              parsing: {
                xAxisKey: 'rangeTo', // Use 'rangeTo' as the x-axis value
                yAxisKey: 'price' // Use 'price' as the y-axis value
              },
              order: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              displayColors: false,
              callbacks: {
                label: function (context) {
                  return `Price per token: ${customFormatNumber(context.parsed.y, 18, 5)}`
                },
                title: function (items) {
                  if (!items[0]) return ``
                  const index = items[0].dataIndex
                  const fromRange = (items[0].dataset?.data[index - 1] as any)?.rangeTo

                  // if (index === items[0].dataset?.data.length - 1)
                  //   return `Max Supply: ${formatNumberUsingNumeral(fromRange).toUpperCase()}`

                  const toRange = (items[0].dataset?.data[index] as any)?.rangeTo
                  return `Range: ${formatNumberUsingNumeral(fromRange || 0).toUpperCase()} - ${formatNumberUsingNumeral(
                    toRange || 0
                  ).toUpperCase()}`
                }
              }
            }
          },
          onHover: function (event, chartElement) {
            if (!event.native) return
            if (chartElement.length) {
              const target = event.native.target as HTMLElement
              target.style.cursor = 'pointer'
            } else {
              const target = event.native.target as HTMLElement
              target.style.cursor = 'default'
            }
          },
          scales: {
            x: {
              type: 'linear',
              title: {
                display: true,
                text: 'Supply',
                color: '#64748b'
              },
              ticks: {
                font: {
                  size: 14
                },
                maxTicksLimit: 6,
                callback: function (value) {
                  return numeral(value).format('0a').toUpperCase()
                },
                color: '#64748b'
              },
              grid: {
                display: false
              }
            },
            y: {
              position: 'right',
              beginAtZero: true,
              ticks: {
                font: {
                  size: 13
                },
                callback: function (value) {
                  return customFormatNumber(+value)
                },
                color: '#64748b'
              },
              grid: {
                display: false
              }
            }
          }
        }
      })
    } else {
      _chart.data.datasets[0].data = curveSteps
      _chart.update()
    }

    // const updateSpecialPoints = (currentSupply: number, arbitraryAmount: number) => {
    //   const afterBuySupply = currentSupply + arbitraryAmount

    //   const currentSupplyPoint = {
    //     rangeTo: currentSupply,
    //     price: getPrice(currentSupply)
    //   }

    //   const afterBuyPoint = {
    //     rangeTo: afterBuySupply,
    //     price: getPrice(afterBuySupply)
    //   }

    //   console.log(currentSupplyPoint, afterBuyPoint)

    //   _chart.data.datasets[1].data = [currentSupplyPoint]
    //   _chart.data.datasets[2].data = [afterBuyPoint]
    //   _chart.update()
    // }

    // console.log('lalala', repoTokenBalance, repoTokenBuyAmount)
    // updateSpecialPoints(Number(repoTokenBalance), Number(repoTokenBuyAmount))

    chart.current = _chart
  }
  return (
    <div className="h-full w-full flex flex-col gap-2 relative">
      <div className="z-10 max-h-[32px] h-full absolute top-0 left-0 flex flex-col items-start justify-between px-4 py-4 gap-1">
        {isFetchingNextPrice ? (
          <div className="flex items-center gap-2">
            <BeatLoader color="#56ADD9" />
            <span className="text-base font-bold text-gray-800">{repo?.bondingCurve?.reserveToken?.tokenTicker}</span>
          </div>
        ) : (
          <h2 className="text-2xl font-bold text-gray-800">
            {customFormatNumber(+nextPrice, 12, 3)}{' '}
            <span className="text-base">{repo?.bondingCurve?.reserveToken?.tokenTicker}</span>
          </h2>
        )}
        <p className="text-base text-gray-700 font-bold">${customFormatNumber(+priceInUSD, 12, 3)}</p>
      </div>
      <div
        // ref={chartContainerRef}
        className="w-full h-full flex items-center bg-white rounded-lg overflow-hidden shadow-md justify-center relative"
      >
        {!chart.current?.data.datasets[0].data.length && (
          <div className="h-full absolute top-0 left-0 z-10 w-full bg-[rgba(245,245,245,0.2)] flex items-center justify-center">
            <h1 className="text-gray-500 text-3xl font-medium">No data</h1>
          </div>
        )}
        <canvas className="w-full h-full p-2" ref={canvasRef}></canvas>
      </div>
      <MarketStats {...stats} />
    </div>
  )
}
