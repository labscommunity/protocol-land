import { ColorType, createChart } from 'lightweight-charts'
import React from 'react'

import MarketStats from './MarketStats'

const styles = {
  backgroundColor: 'white',
  lineColor: '#2962FF',
  textColor: 'black',
  areaTopColor: '#2962FF',
  areaBottomColor: 'rgba(41, 98, 255, 0.28)'
}

type ChartData = {
  time: string | number
  value: number
}

export default function TradeChartComponent({ data }: { data: ChartData[] }) {
  const chartContainerRef = React.useRef<HTMLDivElement>(null)

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
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false
      }
    })
    chart.timeScale().fitContent()

    // const newSeries = chart.addAreaSeries({
    //   lineColor: styles.lineColor,
    //   topColor: styles.areaTopColor,
    //   bottomColor: styles.areaBottomColor,
    //   priceFormat: {
    //     type: 'price',
    //     precision: 16,
    //     minMove: 0.00000001
    //   }
    // })
    const lineSeries = chart.addLineSeries({
      priceFormat: {
        type: 'price',
        precision: 12, // Number of decimal places to display
        minMove: 0.000001 // Minimum price movement
      }
    })
    lineSeries.setData(data as any)

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      chart.remove()
    }
  }, [data])

  return (
    <div className="h-full w-full flex flex-col gap-2">
      <div className="w-full h-full flex items-center bg-white rounded-lg overflow-hidden shadow-md justify-center relative">
        {!data.length && (
          <div className="h-full absolute top-0 left-0 z-10 w-full bg-[rgba(245,245,245,0.2)] flex items-center justify-center">
            <h1 className="text-gray-500 text-3xl font-medium">No data</h1>
          </div>
        )}
        <div className="h-full w-full " ref={chartContainerRef} />
      </div>
      <MarketStats />
    </div>
  )
}
