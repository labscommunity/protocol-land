import { useEffect, useRef, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from 'recharts'

interface DraggablePieChartProps {
  parentTokenHoldersAllocation: number
  meAllocation: number
  onParentTokenHoldersAllocationChange: (newPercentage: number) => void
}

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <>
      <text
        className="text-xs font-medium"
        x={x}
        y={y}
        cx={cx}
        cy={cy}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        alignmentBaseline="middle"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </>
  )
}

export default function DraggablePieChart({
  parentTokenHoldersAllocation,
  meAllocation,
  onParentTokenHoldersAllocationChange
}: DraggablePieChartProps) {
  const [activeIndex] = useState(0)
  const [parentTokenHoldersPercentage, setParentTokenHoldersPercentage] = useState(
    (parentTokenHoldersAllocation / (parentTokenHoldersAllocation + meAllocation)) * 100
  )
  const [isDragging, setIsDragging] = useState(false)
  const [startAngle, setStartAngle] = useState(0)
  const chartRef = useRef<HTMLDivElement>(null)

  const data = [
    { name: 'Parent Token Holders', value: parentTokenHoldersAllocation },
    { name: 'Remaining', value: meAllocation }
  ]

  const COLORS = ['#0088FE', '#56ADD9']

  useEffect(() => {
    const newParentTokenHoldersPercentage =
      (parentTokenHoldersAllocation / (parentTokenHoldersAllocation + meAllocation)) * 100
    setParentTokenHoldersPercentage(newParentTokenHoldersPercentage)
  }, [parentTokenHoldersAllocation, meAllocation])

  const getAngleFromEvent = (e: MouseEvent): number => {
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      return Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI)
    }
    return 0
  }

  //   const handleDragStart = (e: React.MouseEvent<SVGCircleElement>) => {
  //     e.preventDefault()
  //     setIsDragging(true)
  //     setStartAngle(getAngleFromEvent(e.nativeEvent))
  //   }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const currentAngle = getAngleFromEvent(e)
      let angleDiff = currentAngle - startAngle

      if (angleDiff > 180) angleDiff -= 360
      if (angleDiff < -180) angleDiff += 360

      let newParentTokenHoldersPercentage = parentTokenHoldersPercentage + angleDiff / 3.6
      newParentTokenHoldersPercentage = Math.max(10, Math.min(newParentTokenHoldersPercentage, 90))

      setParentTokenHoldersPercentage(newParentTokenHoldersPercentage)
      onParentTokenHoldersAllocationChange(newParentTokenHoldersPercentage)
      setStartAngle(currentAngle)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp]) // Added handleMouseUp to dependencies

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

    return (
      <>
        <g>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
        </g>
        {/* {!isDecentralized && (
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            <circle
              cx={handlePosition.x}
              cy={handlePosition.y}
              r={6}
              fill="white"
              stroke="#333"
              strokeWidth={2}
              className="cursor-move pointer-events-auto"
              onMouseDown={handleDragStart}
            />
          </svg>
        )} */}
      </>
    )
  }

  // Calculate drag handle position
  //   const getDragHandlePosition = () => {
  //     const radius = 80 // Same as chart outer radius
  //     const angle = parentTokenHoldersPercentage * 3.6 * (Math.PI / 180)
  //     const x = Math.cos(angle) * radius + 100 // 100 is half of chart width
  //     const y = Math.sin(angle) * radius + 100 // 100 is half of chart height
  //     return { x, y }
  //   }

  //   const handlePosition = getDragHandlePosition()

  return (
    <div ref={chartRef} className="w-[320px] h-[200px] flex justify-start items-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            innerRadius={0} // Changed to 0 for full background
            outerRadius={80}
            dataKey="value"
            startAngle={90}
            labelLine={false}
            endAngle={-270}
            label={renderCustomizedLabel}
          >
            {data.map((_, index) => (
              <Cell className="overflow-visible" key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Drag Handle */}
    </div>
  )
}
