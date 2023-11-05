import { format } from 'date-fns'
import React from 'react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import {
  FormattedContribution,
  queryAndTransformRepoContributionData,
  transformContributionData,
  UserContributionData
} from '@/lib/user'
import { useGlobalStore } from '@/stores/globalStore'

export default function ActivityGraph() {
  const [selectedRepo, setRepoContributionStats] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo,
    state.repoCoreActions.setRepoContributionStats
  ])

  //   const [isLoading, setIsLoading] = React.useState(false)
  const [contributions, setContributions] = React.useState<FormattedContribution[]>([])

  React.useEffect(() => {
    if (selectedRepo.repo && selectedRepo.repo.name) {
      fetchContributions(selectedRepo.repo.name)
    }
  }, [selectedRepo.repo])

  React.useEffect(() => {
    const { commits, issues, pullRequests } = selectedRepo.statistics

    const hasCommits = commits.length > 0
    const hasIssues = issues.length > 0
    const hasPRs = pullRequests.length > 0

    if (hasCommits || hasIssues || hasPRs) handleTransformContributions(selectedRepo.statistics)
  }, [selectedRepo.statistics])

  async function fetchContributions(name: string) {
    const repoContributionData = await queryAndTransformRepoContributionData(name)

    setRepoContributionStats(repoContributionData)
  }

  function handleTransformContributions(data: UserContributionData) {
    const transformedData = transformContributionData(data)

    setContributions(transformedData)
  }

  const dateFormatter = (date: string) => {
    return format(new Date(date), 'MMM')
  }

  return (
    <ResponsiveContainer width={'100%'} height={100}>
      <AreaChart data={contributions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#56ADD9" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#56ADD9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          className="text-xs font-bold"
          dataKey="date"
          type="category"
          interval={1}
          tickFormatter={dateFormatter}
        />
        <YAxis className="text-xs font-bold" allowDecimals={false} />
        <CartesianGrid strokeDasharray="3 3" />
        <Area type="monotone" dataKey="count" stroke="#56ADD9" fillOpacity={1} fill="url(#colorCount)" />
        <Legend verticalAlign="bottom" content={renderLegend} name="Activity" height={6} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const renderLegend = () => {
  return (
    <div className="flex w-full justify-center">
      <span className="text-sm text-gray-600 font-bold">Activity</span>
    </div>
  )
}
