import 'react-calendar-heatmap/dist/styles.css'

import { format } from 'date-fns'
import React from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import { AiFillFire } from 'react-icons/ai'
// import { BiSync } from 'react-icons/bi'
import { Tooltip } from 'react-tooltip'

import {
  ContributionPercentages,
  ContributionStreak,
  FormattedContribution,
  transformContributionData
} from '@/lib/user'

type Props = {
  handleRefresh: () => Promise<void>
  contributions?: FormattedContribution[]
  percentages: ContributionPercentages
  streakDetails: ContributionStreak
}

type Contributions = ReturnType<typeof transformContributionData>

export default function Contributions({ contributions = [], percentages, streakDetails }: Props) {
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

    if (value.count >= 10) return `fill-primary-700`
    if (value.count >= 5) return `fill-primary-500`
    if (value.count >= 1) return `fill-primary-300`
  }

  function getTooltipDataAttrs(value: { date: Date; count: number }) {
    // Temporary hack around null value.date issue
    if (!value || !value.date) {
      return null
    }
    // Configuration for react-tooltip
    return {
      'data-tooltip-id': 'contribution-tooltip',
      'data-tooltip-content': `${value.count} contributions on ${format(new Date(value.date), 'MMM d, yyyy')}`
    }
  }

  return (
    <div className="flex flex-col w-full border-gray-300 border-[1px] rounded-lg overflow-hidden bg-white">
      {/* <div className="flex items-center text-liberty-dark-100 justify-end px-4 pt-2 font-medium">
        <div
          onClick={handleRefresh}
          className="cursor-pointer flex items-center gap-1 border-b-[1px] border-transparent hover:border-liberty-dark-100"
        >
          <BiSync className="w-5 h-5" /> <span>Refresh</span>
        </div>
      </div> */}
      <div className="w-full pt-4 pb-0 pr-4 flex items-center justify-center">
        <CalendarHeatmap
          showWeekdayLabels
          startDate={getOneYearOldDateInstance()}
          endDate={Date.now()}
          classForValue={getClassForContributionCount}
          values={contributions}
          tooltipDataAttrs={getTooltipDataAttrs}
        />
        <Tooltip id="contribution-tooltip" />
      </div>
      <div className="w-full border-b-[1px] border-gray-200" />
      <div className="w-full p-4 flex">
        <div className="flex w-[50%] flex-col gap-2 pr-4">
          <div className="flex justify-between">
            <span className="text-lg text-gray-600 font-medium">Total Commits:</span>
            <span className="text-xl font-medium text-gray-900">{percentages.commits}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-lg text-gray-600 font-medium">Total PRs:</span>
            <span className="text-xl  text-gray-900 font-medium">{percentages.pullRequests}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-lg text-gray-600 font-medium">Total Issues:</span>
            <span className="text-xl  text-gray-900 font-medium">{percentages.issues}</span>
          </div>
        </div>
        <div className="flex w-[50%] items-center border-l-[1px] border-[#cbc9f6] justify-center gap-4">
          <div className="flex relative justify-center items-center">
            <AiFillFire className="w-24 h-24 text-[#FB8C00]" />
            <span className="absolute text-white text-lg font-bold bottom-6">{streakDetails.days}</span>
          </div>
          <div className="flex flex-col gap-2 items-center justify-center text-liberty-dark-100">
            {streakDetails.days > 0 && (
              <>
                <h1 className="font-medium">Current Streak</h1>
                <p>
                  {streakDetails.start} - {streakDetails.end}
                </p>
              </>
            )}
            {streakDetails.days === 0 && (
              <>
                <h1 className="font-medium text-yellow-600 text-lg">No active streak</h1>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
