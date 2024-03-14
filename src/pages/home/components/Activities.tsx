import { dryrun } from '@permaweb/aoconnect'
import ArdbTransaction from 'ardb/lib/models/transaction'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/common/buttons'
import { AOS_PROCESS_ID } from '@/helpers/constants'
import { getTags } from '@/helpers/getTags'
import ForkModal from '@/pages/repository/components/ForkModal'
import {
  Activity,
  BountyActivityType,
  DeploymentActivityType,
  DomainActivityType,
  Filters,
  IssueActivityType,
  PullRequestActivityType,
  RepositoryActivityType
} from '@/types/explore'
import { Repo } from '@/types/repository'

import { ardb } from '../utils'
import BountyActivity from './BountyActivity'
import DeploymentActivity from './DeploymentActivity'
import DomainActivity from './DomainActivity'
import IssueActivity from './IssueActivity'
import PullRequestActivity from './PullRequestActivity'
import RepositoryActivity from './RepositoryActivity'
import SkeletonLoader from './SkeletonLoader'

const repositoryActions = ['Repo-Created', 'Repo-Forked', 'Repo-TxId-Updated']
const deploymentActions = ['Deployment-Added']
const domainActions = ['Domain-Added', 'Domain-Updated']
const issueActions = ['Issue-Created', 'Issue-Status-Updated']
const pullRequestActions = ['PullRequest-Created', 'PullRequest-Status-Updated']
const bountyActions = ['Bounty-Created', 'Bounty-Updated']

const ACTIVITY_TO_COMPONENT = {
  REPOSITORY: RepositoryActivity,
  ISSUE: IssueActivity,
  PULL_REQUEST: PullRequestActivity,
  BOUNTY: BountyActivity,
  DEPLOYMENT: DeploymentActivity,
  DOMAIN: DomainActivity
}

interface ActivitiesProps {
  filters: Filters
}

const ACTIVITY_LIMIT = 30

export default function Activities({ filters }: ActivitiesProps) {
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [activities, setActivities] = useState<Activity[]>([])
  const [repo, setRepo] = useState<Repo>()
  const [isForkModalOpen, setIsForkModalOpen] = useState(false)
  const cursor = useRef('')
  const repos = useRef<{ [id: string]: Repo }>({})
  const fetchedRepoIds = useRef(new Set<string>())

  function getValueFromTags(tags: Array<{ name: string; value: string }>, name: string) {
    const tag = tags.find((tag) => tag.name === name)

    return tag ? tag.value : ''
  }

  async function fetchActivities({ refresh }: { refresh?: boolean }) {
    setIsLoading(true)

    const actions = []

    if (filters.Bounties) actions.push(...bountyActions)
    if (filters.Deployments) actions.push(...deploymentActions)
    if (filters.Domains) actions.push(...domainActions)
    if (filters.Issues) actions.push(...issueActions)
    if (filters['Pull Requests']) actions.push(...pullRequestActions)
    if (filters.Repositories) actions.push(...repositoryActions)

    const interactions = (await ardb
      .search('transactions')
      .only(['id', 'tags', 'block.timestamp', 'owner.address'])
      .tags([
        { name: 'From-Process', values: AOS_PROCESS_ID },
        { name: 'Action', values: actions }
      ])
      .cursor(activities.length > 0 && !refresh ? cursor.current : '')
      .limit(ACTIVITY_LIMIT)
      .find()) as ArdbTransaction[]

    cursor.current = ardb.getCursor()

    let allActivities: Activity[] = []

    const repoIds = interactions
      .map((interaction) => {
        const repoId = getValueFromTags(interaction.tags, 'Repo-Id')
        if (repoId) return repoId
      })
      .filter((id) => id && !fetchedRepoIds.current.has(id))

    if (repoIds.length > 0) {
      repoIds.forEach((id) => fetchedRepoIds.current.add(id as string))

      const { Messages } = await dryrun({
        process: AOS_PROCESS_ID,
        tags: getTags({ Action: 'Get-Repositories-By-Ids', Ids: JSON.stringify(repoIds) })
      })

      const fetchedRepos = JSON.parse(Messages[0].Data).result as Repo[]
      for (const repo of fetchedRepos) {
        repos.current[repo.id] = repo
      }
    }

    const repositoryActivities = interactions.reduce((accumulator, interaction) => {
      const action = getValueFromTags(interaction.tags, 'Action')
      const repoId = getValueFromTags(interaction.tags, 'Repo-Id')

      const timestamp =
        +getValueFromTags(interaction.tags, 'Timestamp') ||
        (interaction?.block?.timestamp ? interaction?.block?.timestamp * 1000 : Date.now())

      if (repositoryActions.includes(action) && repoId) {
        const existingActivity = accumulator.find((activity) => activity.repo.id === repoId && !activity.created)
        if (!existingActivity) {
          const repo = repos.current[repoId]
          const created = ['Repo-Forked', 'Repo-Created'].includes(action)
          accumulator.push({
            type: 'REPOSITORY',
            repo,
            created,
            timestamp: timestamp,
            author: interaction.owner.address
          } as RepositoryActivityType)
        }
      } else if (deploymentActions.includes(action) && repoId) {
        const repo = repos.current[repoId]
        const created = action === 'Deployment-Added'
        const deployment = {
          deployedBy: interaction.owner.address,
          commitOid: '',
          timestamp: timestamp,
          ...JSON.parse(getValueFromTags(interaction.tags, 'Deployment'))
        }

        accumulator.push({
          type: 'DEPLOYMENT',
          repo,
          deployment,
          created,
          timestamp: timestamp
        } as DeploymentActivityType)
      } else if (domainActions.includes(action) && repoId) {
        const repo = repos.current[repoId]
        const created = action === 'addDomain'
        const parsedDomain = JSON.parse(getValueFromTags(interaction.tags, 'Deployment'))
        const domain = created
          ? {
              txId: parsedDomain.txId,
              name: parsedDomain.name,
              contractTxId: parsedDomain.contractTxId,
              controller: interaction.owner.address,
              timestamp
            }
          : repo.domains.find((d) => d.name === parsedDomain.name || d.contractTxId === parsedDomain.contractTxId)

        accumulator.push({
          type: 'DOMAIN',
          repo: repo,
          domain,
          created,
          timestamp: timestamp
        } as DomainActivityType)
      } else if (issueActions.includes(action) && repoId) {
        const repo = repos.current[repoId]
        const created = action === 'Issue-Created'
        const issueParsed = JSON.parse(getValueFromTags(interaction.tags, 'Issue'))
        const issue = created
          ? {
              id: +issueParsed.id,
              repoId: repo.id,
              title: issueParsed.title,
              description: issueParsed.description ?? '',
              author: interaction.owner.address,
              status: 'OPEN',
              timestamp,
              assignees: [],
              activities: [],
              bounties: [],
              linkedPRIds: []
            }
          : repo.issues[+issueParsed.id - 1]

        accumulator.push({
          type: 'ISSUE',
          repo,
          issue: {
            ...issue,
            timestamp,
            author: interaction.owner.address,
            status: created ? 'OPEN' : issueParsed.status
          },
          created,
          timestamp: timestamp
        } as IssueActivityType)
      } else if (pullRequestActions.includes(action) && repoId) {
        const repo = repos.current[repoId]
        const created = action === 'PullRequest-Created'
        const prParsed = JSON.parse(getValueFromTags(interaction.tags, 'Pull-Request'))
        const pullRequest = created
          ? {
              id: +prParsed.id,
              repoId: repo.id,
              title: prParsed.title,
              author: interaction.owner.address,
              status: 'OPEN',
              reviewers: [],
              activities: [],
              timestamp
            }
          : repo.pullRequests[+prParsed.id - 1]

        accumulator.push({
          type: 'PULL_REQUEST',
          repo,
          pullRequest: {
            ...pullRequest,
            timestamp,
            author: interaction.owner.address,
            status: created ? 'OPEN' : prParsed.status
          },
          created,
          timestamp: timestamp
        } as PullRequestActivityType)
      } else if (bountyActions.includes(action) && repoId) {
        const repo = repos.current[repoId]
        const issueId = getValueFromTags(interaction.tags, 'Issue-Id')
        const issue = repo.issues[+issueId - 1]
        const bountyParsed = JSON.parse(getValueFromTags(interaction.tags, 'Bounty') || '{}')
        const bountyId = getValueFromTags(interaction.tags, 'Bounty-Id')
        const created = action === 'Bounty-Created'
        const bounty = created
          ? {
              ...bountyParsed,
              paymentTxId: null,
              status: 'ACTIVE',
              timestamp
            }
          : issue.bounties[+bountyId - 1]

        accumulator.push({
          type: 'BOUNTY',
          repo,
          bounty,
          issue,
          created,
          timestamp
        } as BountyActivityType)
      }

      return accumulator
    }, [] as Activity[])

    allActivities = [...allActivities, ...repositoryActivities]

    // Filter out all private repos activities
    allActivities = allActivities.filter((activity) => !activity?.repo?.private)

    setActivities((previousActivities) =>
      [...previousActivities, ...allActivities].sort((a, b) => b.timestamp - a.timestamp)
    )

    setHasNextPage(interactions?.length === ACTIVITY_LIMIT)
    setIsLoading(false)
  }

  useEffect(() => {
    setHasNextPage(true)
    setActivities([])
    fetchActivities({ refresh: true })
  }, [filters])

  return (
    <div className="w-full">
      <div className="flex flex-col gap-8">
        {activities.length > 0 ? (
          activities.map((activity, index) => {
            const ActivityComponent = ACTIVITY_TO_COMPONENT[activity.type]
            return (
              <ActivityComponent
                key={`activity-${index}`}
                // @ts-ignore
                activity={activity}
                setIsForkModalOpen={setIsForkModalOpen}
                setRepo={setRepo}
              />
            )
          })
        ) : !hasNextPage && activities.length === 0 ? (
          <div className="flex justify-center items-center flex-col gap-1 border-gray-300 border rounded-md py-8 px-4">
            <span className="font-medium">That's all for now</span>
            <span className="text-sm text-center">You can adjust your filters to see more content.</span>
          </div>
        ) : (
          Array.from({ length: 10 }, (_, index) => <SkeletonLoader key={`skeleton-${index}`} />)
        )}
      </div>
      {hasNextPage && (
        <div className="w-full flex mt-4 justify-center" onClick={() => fetchActivities({})}>
          <Button
            variant="primary-outline"
            loadingText={activities.length === 0 ? 'Loading' : 'Loading more'}
            isLoading={isLoading}
            disabled={isLoading || !hasNextPage}
          >
            Load more
          </Button>
        </div>
      )}
      {repo && <ForkModal isOpen={isForkModalOpen} setIsOpen={setIsForkModalOpen} repo={repo} />}
    </div>
  )
}
