import ArdbTransaction from 'ardb/lib/models/transaction'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/common/buttons'
import { dryrun } from '@/helpers/aoconnect'
import { AOS_PROCESS_ID } from '@/helpers/constants'
import { getTags } from '@/helpers/getTags'
import ForkModal from '@/pages/repository/components/ForkModal'
import {
  Activity,
  ActivityRepo,
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
const pullRequestActions = ['PR-Created', 'PR-Status-Updated']
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

const ACTIVITY_LIMIT = 20

export default function Activities({ filters }: ActivitiesProps) {
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentFetchCount, setCurrentFetchCount] = useState(0)
  const [activities, setActivities] = useState<Activity[]>([])
  const [repo, setRepo] = useState<Repo>()
  const [isForkModalOpen, setIsForkModalOpen] = useState(false)
  const cursor = useRef('')

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
      .only(['id', 'tags', 'block.timestamp', 'recipient'])
      .tags([
        { name: 'From-Process', values: AOS_PROCESS_ID },
        { name: 'Action', values: actions }
      ])
      .cursor(activities.length > 0 && !refresh ? cursor.current : '')
      .limit(ACTIVITY_LIMIT)
      .find()) as ArdbTransaction[]

    cursor.current = ardb.getCursor()

    const items = interactions
      .map((interaction) => {
        const action = getValueFromTags(interaction.tags, 'Action')
        const repoId = getValueFromTags(interaction.tags, 'Repo-Id')

        if (!repoId) return

        switch (action) {
          case 'Repo-Created':
          case 'Repo-Forked':
          case 'Repo-TxId-Updated': {
            return { interaction, payload: { repoId, type: 'repo' } }
          }

          case 'Bounty-Created':
          case 'Bounty-Updated': {
            const issueId = getValueFromTags(interaction.tags, 'Issue-Id')
            const bountyId = getValueFromTags(interaction.tags, 'Bounty-Id')
            if (issueId && bountyId)
              return {
                interaction,
                payload: { repoId, issueId: parseInt(issueId), bountyId: parseInt(bountyId), type: 'bounty' }
              }
            break
          }

          case 'Deployment-Added': {
            const deploymentTxId = getValueFromTags(interaction.tags, 'Deployment-TxId')
            if (deploymentTxId) return { interaction, payload: { repoId, deploymentTxId, type: 'deployment' } }
            break
          }

          case 'Domain-Added':
          case 'Domain-Updated': {
            const domainName = getValueFromTags(interaction.tags, 'Domain-Name')
            if (domainName) return { interaction, payload: { repoId, domainName, type: 'domain' } }
            break
          }

          case 'Issue-Created':
          case 'Issue-Status-Updated': {
            const issueId = getValueFromTags(interaction.tags, 'Issue-Id')
            if (issueId) return { interaction, payload: { repoId, issueId: parseInt(issueId), type: 'issue' } }
            break
          }

          case 'PR-Created':
          case 'PR-Status-Updated': {
            const prId = getValueFromTags(interaction.tags, 'PR-Id')
            if (prId) return { interaction, payload: { repoId, prId: parseInt(prId), type: 'pr' } }
            break
          }
        }
      })
      .filter((d) => !!d)

    const { Messages } = await dryrun({
      process: AOS_PROCESS_ID,
      tags: getTags({
        Action: 'Get-Explore-Page-Repos',
        Payload: JSON.stringify(items.map((item) => item!.payload))
      })
    })

    const repos = JSON.parse(Messages[0].Data).result as ActivityRepo[]

    let newActivities = items
      .map((item) => item!.interaction)
      .reduce((accumulator, interaction, index) => {
        const action = getValueFromTags(interaction.tags, 'Action')
        const repoId = getValueFromTags(interaction.tags, 'Repo-Id')
        const recipient = getValueFromTags(interaction.tags, 'Recipient') || interaction.recipient
        const repo = repos[index]

        if (repo?.private) return accumulator

        const timestamp =
          +getValueFromTags(interaction.tags, 'Timestamp') ||
          (interaction?.block?.timestamp ? interaction?.block?.timestamp * 1000 : Date.now())

        if (repositoryActions.includes(action) && repoId) {
          const created = ['Repo-Forked', 'Repo-Created'].includes(action)
          const existingActivity = accumulator.find(
            (activity) => activity.type === 'REPOSITORY' && activity.repo.id === repoId && !activity.created && !created
          )
          if (!existingActivity) {
            accumulator.push({
              type: 'REPOSITORY',
              repo,
              created,
              timestamp,
              author: recipient
            } as RepositoryActivityType)
          }
        } else if (deploymentActions.includes(action) && repoId) {
          const created = action === 'Deployment-Added'
          const deployment = {
            deployedBy: recipient,
            commitOid: '',
            timestamp,
            ...JSON.parse(getValueFromTags(interaction.tags, 'Deployment'))
          }

          accumulator.push({
            type: 'DEPLOYMENT',
            repo,
            deployment,
            created,
            timestamp
          } as DeploymentActivityType)
        } else if (domainActions.includes(action) && repoId) {
          const created = action === 'Domain-Added'
          const parsedDomain = JSON.parse(getValueFromTags(interaction.tags, 'Domain'))
          const domain = created
            ? {
                txId: parsedDomain.txId,
                name: parsedDomain.name,
                contractTxId: parsedDomain.contractTxId,
                controller: recipient,
                timestamp
              }
            : repo.domain

          accumulator.push({
            type: 'DOMAIN',
            repo: repo,
            domain,
            created,
            timestamp
          } as DomainActivityType)
        } else if (issueActions.includes(action) && repoId) {
          const created = action === 'Issue-Created'
          const issueParsed = JSON.parse(getValueFromTags(interaction.tags, 'Issue'))
          const issue = created
            ? {
                id: +issueParsed.id,
                title: issueParsed.title,
                description: issueParsed.description ?? '',
                author: recipient,
                status: 'OPEN',
                timestamp,
                comments: 0
              }
            : repo.issue

          accumulator.push({
            type: 'ISSUE',
            repo,
            issue: {
              ...issue,
              timestamp,
              completedTimestamp: timestamp,
              author: recipient,
              status: created ? 'OPEN' : issueParsed.status
            },
            created,
            timestamp
          } as IssueActivityType)
        } else if (pullRequestActions.includes(action) && repoId) {
          const created = action === 'PR-Created'
          const prParsed = JSON.parse(getValueFromTags(interaction.tags, 'Pull-Request'))
          const pullRequest = created
            ? {
                id: +prParsed.id,
                title: prParsed.title,
                author: recipient,
                status: 'OPEN',
                comments: 0,
                timestamp
              }
            : repo.pullRequest

          accumulator.push({
            type: 'PULL_REQUEST',
            repo,
            pullRequest: {
              ...pullRequest,
              timestamp,
              author: recipient,
              status: created ? 'OPEN' : prParsed.status
            },
            created,
            timestamp
          } as PullRequestActivityType)
        } else if (bountyActions.includes(action) && repoId) {
          const issue = repo.issue
          const bountyParsed = JSON.parse(getValueFromTags(interaction.tags, 'Bounty') || '{}')
          const created = action === 'Bounty-Created'
          const bounty = created
            ? {
                ...bountyParsed,
                paymentTxId: null,
                status: 'ACTIVE',
                timestamp
              }
            : repo.issue!.bounty

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

    if (newActivities.length > 0) {
      newActivities = newActivities.sort((a, b) => b.timestamp - a.timestamp)
      setActivities((previousActivities) => [...previousActivities, ...newActivities])
    }

    setCurrentFetchCount(newActivities.length)
    setHasNextPage(interactions?.length === ACTIVITY_LIMIT)
    setCurrentPage((page) => page + 1)
    setIsLoading(false)
  }

  useEffect(() => {
    setHasNextPage(true)
    setActivities([])
    fetchActivities({ refresh: true })
  }, [filters])

  useEffect(() => {
    if (currentPage > 1 && hasNextPage && currentFetchCount === 0) {
      fetchActivities({})
    }
  }, [currentPage])

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
