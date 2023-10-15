import React from 'react'
import { useParams } from 'react-router-dom'

import { withAsync } from '@/helpers/withAsync'
import {
  computeContributionsFromRepo,
  ContributionPercentages,
  ContributionStreak,
  FormattedContribution,
  getCurrentContributionStreak,
  queryAndTransformUserContributionData,
  transformContributionData,
  UserContributionData
} from '@/lib/user'
import { useGlobalStore } from '@/stores/globalStore'
import { Repo } from '@/types/repository'
import { User } from '@/types/user'

import Contributions from './components/Contributions'
import ReadMe from './components/ReadMe'

export default function OverviewTab({ userDetails, userRepos }: { userDetails: Partial<User>; userRepos: Repo[] }) {
  const [statistics, updateUserContributionStats] = useGlobalStore((state) => [
    state.userState.userDetails.statistics,
    state.userActions.updateUserContributionStats
  ])
  const { id } = useParams()

  const [contributions, setContributions] = React.useState<FormattedContribution[]>([])
  const [contributionPercentages, setContributionsPercentages] = React.useState<ContributionPercentages>({
    commits: '0%',
    issues: '0%',
    pullRequests: '0%'
  })
  const [contributionStreak, setContributionsStreak] = React.useState<ContributionStreak>({
    start: '',
    end: '',
    days: 0
  })

  React.useEffect(() => {
    if (id) fetchContributions(id)
  }, [id])

  React.useEffect(() => {
    if (statistics) handleTransformContributions(statistics)
  }, [statistics])

  function handleTransformContributions(data: UserContributionData) {
    const transformedData = transformContributionData(data)
    const streakData = getCurrentContributionStreak(transformedData)

    setContributions(transformedData)
    setContributionsStreak(streakData)
  }

  async function handleRefreshContributions() {
    const { error, response } = await withAsync(() => computeContributionsFromRepo(userRepos, userDetails.email, id!))

    if (!error && response) {
      await updateUserContributionStats(response)
    }
  }

  async function fetchContributions(address: string) {
    const userContributionData = await queryAndTransformUserContributionData(address)
    const userContributionPercentages = calculatePercentages(userContributionData)

    await updateUserContributionStats(userContributionData)
    setContributionsPercentages(userContributionPercentages)
  }

  function calculatePercentages(contributionData: UserContributionData) {
    const totalCommits = contributionData.commits.length
    const totalPRs = contributionData.pullRequests.length
    const totalIssues = contributionData.issues.length

    const totalItems = totalCommits + totalPRs + totalIssues

    return {
      commits: ((totalCommits / totalItems) * 100).toFixed(0) + '%',
      pullRequests: ((totalPRs / totalItems) * 100).toFixed(0) + '%',
      issues: ((totalIssues / totalItems) * 100).toFixed(0) + '%'
    }
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <ReadMe readmeTxId={userDetails.readmeTxId || ''} />
      <Contributions
        streakDetails={contributionStreak}
        percentages={contributionPercentages}
        contributions={contributions}
        handleRefresh={handleRefreshContributions}
      />
    </div>
  )
}
