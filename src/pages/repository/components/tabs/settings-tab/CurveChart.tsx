import Chart from 'chart.js/auto'
import numeral from 'numeral'
import React from 'react'

import { CurveStep } from '@/lib/discrete-bonding-curve/curve'
import { customFormatNumber, formatNumberUsingNumeral } from '@/pages/repository/helpers/customFormatNumbers'

export default function CurveChart({ curveSteps }: { curveSteps: CurveStep[] }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const chart = React.useRef<Chart<'line', CurveStep[], unknown> | null>(null)
  // const [isLoading, setIsLoading] = useState(false)

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
  React.useEffect(() => {
    initializeChartCallback(curveSteps)
  }, [curveSteps, chart])

  const initializeChartCallback = React.useCallback(
    (steps: CurveStep[]) => {
      initializeChart(steps)
    },
    [curveSteps]
  )

  function initializeChart(steps: CurveStep[]) {
    const ctx = canvasRef.current
    if (!ctx) return
    let _chart: Chart<'line', CurveStep[], unknown> | null = chart.current

    if (!_chart) {
      _chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Price',
              data: steps,
              borderColor: '#06b6d4',
              backgroundColor: 'transparent',
              borderWidth: 2,
              pointBackgroundColor: '#06b6d4',
              stepped: 'before',
              fill: true,
              parsing: {
                xAxisKey: 'rangeTo', // Use 'rangeTo' as the x-axis value
                yAxisKey: 'price' // Use 'price' as the y-axis value
              }
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
                  return `Range: ${formatNumberUsingNumeral(fromRange || 0).toUpperCase()} - ${formatNumberUsingNumeral(toRange || 0).toUpperCase()}`
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
                color: '#e2e8f0'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Price (qAR)',
                color: '#64748b'
              },
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
                color: '#e2e8f0'
              }
            }
          }
        }
      })
    } else {
      _chart.data.datasets[0].data = curveSteps
      _chart.update()
    }

    chart.current = _chart
  }

  return (
    <div className="flex w-[60%] flex-col bg-white border-[1px] border-gray-300 rounded-lg p-4 min-h-[300px]">
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}
