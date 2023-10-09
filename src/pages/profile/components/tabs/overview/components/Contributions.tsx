import 'react-calendar-heatmap/dist/styles.css'

import React from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import { AiFillFire } from 'react-icons/ai'

export default function Contributions() {
  const getOneYearOldDateInstance = React.useCallback(() => {
    const currentDate = new Date() // Get the current date
    currentDate.setFullYear(currentDate.getFullYear() - 1)
    currentDate.setDate(currentDate.getDate() - 4)

    return currentDate
  }, [])

  function getClassForContributionCount(value: any) {
    if (!value) {
      return 'color-empty'
    }

    if (value.count >= 10) return `fill-purple-700`
    if (value.count >= 5) return `fill-purple-500`
    if (value.count >= 1) return `fill-purple-300`
  }

  return (
    <div className="flex flex-col text-p w-full border-[1px] border-[#cbc9f6] bg-white rounded-lg">
      <div className="w-full pt-4 pb-0 pr-4 flex items-center justify-center">
        <CalendarHeatmap
          showWeekdayLabels
          startDate={getOneYearOldDateInstance()}
          endDate={Date.now()}
          classForValue={getClassForContributionCount}
          values={[
            { date: '2023-01-01', count: 1 },
            { date: '2023-01-02', count: 5 },
            { date: '2023-01-05', count: 10 },
            { date: '2023-01-06', count: 4 },
            { date: '2023-01-07', count: 6 },
            { date: '2023-01-22', count: 122 },
            { date: '2023-03-22', count: 122 },
            { date: '2023-04-22', count: 122 },
            { date: '2023-05-22', count: 122 },
            { date: '2023-07-30', count: 38 },
            { date: '2023-08-26', count: 3 },
            { date: '2023-08-27', count: 4 },
            { date: '2023-08-28', count: 7 },
            { date: '2023-08-29', count: 13 },
            { date: '2023-09-30', count: 7 },
            { date: '2023-09-31', count: 2 },
            { date: '2023-10-1', count: 5 },
            { date: '2023-10-2', count: 4 },
            { date: '2023-10-3', count: 8 },
            { date: '2023-10-4', count: 11 }

            // ...and so on
          ]}
        />
      </div>
      <div className="w-full border-b-[1px] border-[#cbc9f6]" />
      <div className="w-full p-4 flex">
        <div className="flex w-[50%] flex-col gap-2 pr-4">
          <div className="flex text-liberty-dark-100 justify-between">
            <span className="text-lg font-medium">Total Commits:</span>
            <span className="text-xl font-bold">75%</span>
          </div>
          <div className="flex text-liberty-dark-100 justify-between">
            <span className="text-lg font-medium">Total PRs:</span>
            <span className="text-xl font-bold">15%</span>
          </div>
          <div className="flex text-liberty-dark-100 justify-between">
            <span className="text-lg font-medium">Total Issues:</span>
            <span className="text-xl font-bold">10%</span>
          </div>
        </div>
        <div className="flex w-[50%] items-center border-l-[1px] border-[#cbc9f6] justify-center gap-4">
          <div className="flex relative justify-center items-center">
            <AiFillFire className="w-24 h-24 text-[#FB8C00]" />
            <span className="absolute text-white text-lg font-bold bottom-6">14</span>
          </div>
          <div className="flex flex-col gap-2 items-center text-liberty-dark-100">
            <h1 className="font-medium">Current Streak</h1>
            <p>Dec 19, 2021 - Oct 4, 2023 </p>
          </div>
        </div>
      </div>
    </div>
  )
}
