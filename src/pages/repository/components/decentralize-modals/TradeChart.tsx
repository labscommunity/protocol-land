import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { CurveStep } from '@/lib/discrete-bonding-curve/curve'
import { RepoLiquidityPoolToken, RepoToken } from '@/types/repository'

import { formatNumberUsingNumeral, preventScientificNotationFloat } from '../../helpers/customFormatNumbers'

// import { CurveStepExternal, CurveStepInternal } from '@/types/repository'

export function TradeChart({
  steps,
  currentIndex,
  tokenA,
  tokenB,
  afterTradeSupply
}: {
  steps: CurveStep[]
  currentIndex: number | null
  tokenA: RepoToken
  tokenB: RepoLiquidityPoolToken
  afterTradeSupply: { rangeTo: number; price: number; index: number } | null
}) {
  const [data, setData] = useState<CurveStep[]>([])
  const [tooltip, setTooltip] = useState<{
    show: boolean
    x: number
    y: number
    index: number
  }>({
    show: false,
    x: 0,
    y: 0,
    index: 0
  })

  useEffect(() => {
    if (steps.length > 0) {
      setData(
        steps.map((step) => ({
          rangeTo: BigNumber(step.rangeTo).dividedBy(BigNumber(10).pow(tokenA.denomination)).toNumber(),
          price: BigNumber(step.price).dividedBy(BigNumber(10).pow(tokenB.denomination)).toNumber()
        }))
      )
    }
  }, [steps])

  const handleMouseEnter = (event: any) => {
    console.log(event)
    setTooltip({
      show: true,
      x: event.cx,
      y: event.cy,
      index: Number(event.id)
    })
  }

  const handleMouseLeave = () => {
    console.log('leave')
    setTooltip({ ...tooltip, show: false })
  }

  const handleTooltipLabel = (label: string) => {
    const currentIndex = data.findIndex((entry) => entry.rangeTo === Number(label))
    const previousIndex = currentIndex - 1
    const previousStep = previousIndex > 0 ? data[previousIndex] : { rangeTo: 0, price: 0 }
    const currentStep = data[currentIndex]

    const previousStepFormatted = formatNumberUsingNumeral(previousStep.rangeTo).toUpperCase()
    const currentStepFormatted = formatNumberUsingNumeral(currentStep.rangeTo).toUpperCase()

    return `Mint Range: ${previousStepFormatted} - ${currentStepFormatted}`
  }

  const formatXAxisTick = (value: number) => {
    return formatNumberUsingNumeral(value).toUpperCase()
  }

  return (
    <div className="h-full w-full z-50">
      <ResponsiveContainer className="w-full min-h-[450px] z-50">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#000" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#000" />
              <stop offset="100%" stopColor="#000" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.25)" vertical={false} />
          <XAxis
            dataKey="rangeTo"
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatXAxisTick}
            type="number"
            tick={{ fontSize: 12 }}
            domain={[0, 'dataMax']}
            interval={'preserveStartEnd'}
            tickCount={6}
            label={{
              value: 'Minting Supply',
              offset: 0,
              position: 'insideBottom'
            }}
          />
          <YAxis
            stroke="#64748b"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            interval={'preserveStartEnd'}
            dataKey="price"
            domain={[0, 'dataMax']}
            label={{
              value: 'Price in qAR',
              angle: -90,
              position: 'insideLeft'
            }}
            tickCount={6}
          />
          <Tooltip
            wrapperClassName={tooltip.show ? 'hidden' : ''}
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            itemStyle={{ color: 'rgba(255,255,255,0.7)' }}
            labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
            formatter={(value: number) => [`${preventScientificNotationFloat(value)} qAR`, 'Price']}
            labelFormatter={handleTooltipLabel}
          />
          <Area type="monotone" dataKey="price" stroke="none" fill="#000" />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 6,
              fill: '#06b6d4',
              stroke: '#06b6d4',
              strokeWidth: 0.8
            }}
          />
          <ReferenceLine
            rotate={-90}
            x={data[currentIndex || 0]?.rangeTo}
            stroke="#06b6d4"
            label={{
              value: 'Current Minting Range',
              position: 'insideLeft',
              angle: -90
            }}
          />

          {afterTradeSupply && (
            <>
              <ReferenceLine
                rotate={-90}
                x={afterTradeSupply.rangeTo}
                stroke="#06b6d4"
                label={{
                  value: 'After Trade Supply',
                  position: 'insideLeft',
                  angle: -90
                }}
              />
              <ReferenceDot
                x={afterTradeSupply.rangeTo}
                y={afterTradeSupply.price}
                r={6}
                id={afterTradeSupply.index.toString()}
                fill="green"
                shape={<PulsingDot />}
                stroke="green"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            </>
          )}

          <ReferenceDot
            x={data[currentIndex || 0]?.rangeTo}
            y={data[currentIndex || 0]?.price}
            id={currentIndex?.toString() || '0'}
            r={6}
            fill="#06b6d4"
            shape={<PulsingDot />}
            stroke="#06b6d4"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        </LineChart>
      </ResponsiveContainer>
      <CustomTooltip {...tooltip} data={data} />
    </div>
  )
}

// A simple custom tooltip component
function CustomTooltip({
  x,
  y,
  show,
  index,
  data
}: {
  x: number
  y: number
  show: boolean
  index: number
  data: CurveStep[]
}) {
  if (!show) return null

  const style: React.CSSProperties = {
    position: 'absolute',
    left: x - 75, // offset the mouse position a bit
    top: y + 20,
    padding: '6px 8px',
    backgroundColor: 'rgba(0,0,0,0.8)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    color: 'rgba(255,255,255,0.7)',
    pointerEvents: 'none', // so mouse events pass through
    zIndex: 999,
    width: '250px'
  }

  const step = data[index || 0]
  const previousStep = index > 0 ? data[index - 1] : { rangeTo: 0, price: 0 }
  const previousStepFormatted = formatNumberUsingNumeral(previousStep.rangeTo).toUpperCase()
  const currentStepFormatted = formatNumberUsingNumeral(step.rangeTo).toUpperCase()
  return (
    <div className="z-50 flex flex-col gap-2" style={style as React.CSSProperties}>
      <p>
        Current Range: {previousStepFormatted} - {currentStepFormatted}
      </p>
      <p>Price: {preventScientificNotationFloat(step.price)} qAR</p>
    </div>
  )
}

function PulsingDot(props: any) {
  // The ReferenceDot will pass certain props to your custom shape,
  // typically including cx, cy, r, and fill.
  // You can add stroke, strokeWidth, etc., as needed.
  const { cx, cy, id, r = 6, fill = '#a855f7', stroke = '#fff', onMouseEnter, onMouseLeave } = props

  return (
    <g className="z-50" onMouseEnter={() => onMouseEnter({ id, cx, cy })} onMouseLeave={() => onMouseLeave()}>
      {/* 1) The central dot */}
      <circle cx={cx} cy={cy} r={r} fill={fill} />

      {/* 2) A pulsing ring that grows & fades out repeatedly */}
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} fillOpacity={0.3}>
        {/* Expand radius from r to (r+10), for example, over 1s */}
        <animate attributeName="r" values={`${r};${r + 10}`} dur="1s" repeatCount="indefinite" />
        {/* Fade out the ring from opacity=0.3 to 0 over 1s */}
        <animate attributeName="opacity" values="1;0" dur="1s" repeatCount="indefinite" />
      </circle>
    </g>
  )
}
