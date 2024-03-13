import { Tag } from 'arweave/web/lib/transaction'
import { Dispatch, SetStateAction } from 'react'

import { Bounty, Deployment, Domain, Issue, PullRequest, Repo, RepoWithParent } from '@/types/repository'

export type ActivityType = 'REPOSITORY' | 'ISSUE' | 'PULL_REQUEST' | 'BOUNTY' | 'DEPLOYMENT' | 'DOMAIN'

export interface Interaction {
  id: string
  owner: {
    address: string
  }
  block: {
    timestamp: string
  }
  tags: Tag[]
}

export type Filters = {
  Repositories: boolean
  'Pull Requests': boolean
  Issues: boolean
  Bounties: boolean
  Domains: boolean
  Deployments: boolean
}

export type ActivityBase = {
  type: ActivityType
  repo: RepoWithParent
  timestamp: number
  created: boolean
}

export interface RepositoryActivityType extends ActivityBase {
  type: 'REPOSITORY'
  author: string
}

export interface IssueActivityType extends ActivityBase {
  type: 'ISSUE'
  issue: Issue
}

export interface PullRequestActivityType extends ActivityBase {
  type: 'PULL_REQUEST'
  pullRequest: PullRequest
}

export interface BountyActivityType extends ActivityBase {
  type: 'BOUNTY'
  issue: Issue
  bounty: Bounty
}

export interface DeploymentActivityType extends ActivityBase {
  type: 'DEPLOYMENT'
  deployment: Deployment
}

export interface DomainActivityType extends ActivityBase {
  type: 'DOMAIN'
  domain: Domain
}

export type Activity =
  | RepositoryActivityType
  | IssueActivityType
  | PullRequestActivityType
  | BountyActivityType
  | DeploymentActivityType
  | DomainActivityType

export interface ActivityProps<T> {
  activity: T
  setIsForkModalOpen: Dispatch<SetStateAction<boolean>>
  setRepo: Dispatch<SetStateAction<Repo | undefined>>
}
