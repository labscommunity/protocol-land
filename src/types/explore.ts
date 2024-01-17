import { Tag } from 'warp-contracts/web'

import { Bounty, Deployment, Domain, Issue, PullRequest, Repo } from '@/types/repository'

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

export type Interactions = Array<{
  interaction: Interaction
}>

export interface Paging {
  total: number
  limit: number
  items: number
  page: number
  pages: number
}

export interface ValidityResponse {
  validity: Record<string, boolean>
  state: {
    repos: { [key: string]: Repo }
  }
}

export interface ActivitiesProps {
  filters: Filters
}

export type Filters = {
  Repositories: boolean
  'Pull Requests': boolean
  Issues: boolean
  Bounties: boolean
  Domains: boolean
  Deployments: boolean
}

export type ActivityInteraction = {
  type: ActivityType
  repo: Repo
  timestamp: number
  created: boolean
  issue?: Issue
  pullRequest?: PullRequest
  bounty?: Bounty
  deployment?: Deployment
  domain?: Domain
}
