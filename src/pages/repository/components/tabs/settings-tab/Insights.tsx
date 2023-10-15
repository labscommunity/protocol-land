import React from 'react'

import {
  ContributionPercentages,
  ContributionStreak,
  FormattedContribution,
  getCurrentContributionStreak,
  queryAndTransformRepoContributionData,
  transformContributionData,
  UserContributionData
} from '@/lib/user'
import Contributions from '@/pages/profile/components/tabs/overview/components/Contributions'
import { useGlobalStore } from '@/stores/globalStore'

export default function Insights() {
  const [selectedRepo, setRepoContributionStats] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo,
    state.repoCoreActions.setRepoContributionStats
  ])

  const [contributionStreak, setContributionsStreak] = React.useState<ContributionStreak>({
    start: '',
    end: '',
    days: 0
  })
  const [contributionPercentages, setContributionsPercentages] = React.useState<ContributionPercentages>({
    commits: '0%',
    issues: '0%',
    pullRequests: '0%'
  })
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
    const repoContributionPercentages = calculatePercentages(repoContributionData)

    setRepoContributionStats(repoContributionData)
    setContributionsPercentages(repoContributionPercentages)
  }

  function handleTransformContributions(data: UserContributionData) {
    const transformedData = transformContributionData(data)
    const streakData = getCurrentContributionStreak(transformedData)

    setContributions(transformedData)
    setContributionsStreak(streakData)
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

  async function handleRefreshContributions() {
    //
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full border-b-[1px] border-[#cbc9f6] py-1">
        <h1 className="text-2xl text-liberty-dark-100">Contributions</h1>
      </div>
      <div className="flex flex-col gap-4">
        <Contributions
          streakDetails={contributionStreak}
          percentages={contributionPercentages}
          contributions={contributions}
          handleRefresh={handleRefreshContributions}
        />
      </div>
    </div>
  )
}
