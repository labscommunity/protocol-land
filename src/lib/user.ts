import Arweave from 'arweave'
import { add, format, fromUnixTime, isFuture, isToday, isYesterday } from 'date-fns'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { toArrayBuffer } from '@/helpers/toArrayBuffer'
import { waitFor } from '@/helpers/waitFor'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'
import { CommitObject } from '@/types/commit'
import { Issue, PullRequest, Repo } from '@/types/repository'

import { importRepoFromBlob, unmountRepoFromBrowser } from './git'
import { getAllCommits } from './git/commit'
import { fsWithName } from './git/helpers/fsWithName'

const arweave = new Arweave({
  host: 'ar-io.net',
  port: 443,
  protocol: 'https'
})

export async function uploadUserAvatar(avatar: File) {
  const address = useGlobalStore.getState().authState.address
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const data = (await toArrayBuffer(avatar)) as ArrayBuffer
  await waitFor(500)

  const inputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'Content-Type', value: avatar.type },
    { name: 'Creator', value: address || '' },
    { name: 'Type', value: 'avatar-update' }
  ]

  const transaction = await arweave.createTransaction({
    data
  })

  inputTags.forEach((tag) => transaction.addTag(tag.name, tag.value))

  const dataTxResponse = await window.arweaveWallet.dispatch(transaction)

  if (!dataTxResponse.id) {
    throw new Error('Failed to post avatar')
  }

  return dataTxResponse.id
}

export async function uploadUserReadMe(content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })

  const address = useGlobalStore.getState().authState.address
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const data = (await toArrayBuffer(blob)) as ArrayBuffer
  await waitFor(500)

  const inputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'Content-Type', value: blob.type },
    { name: 'Creator', value: address || '' },
    { name: 'Type', value: 'readme-update' }
  ]

  const transaction = await arweave.createTransaction({
    data
  })

  inputTags.forEach((tag) => transaction.addTag(tag.name, tag.value))

  const dataTxResponse = await window.arweaveWallet.dispatch(transaction)

  if (!dataTxResponse.id) {
    throw new Error('Failed to post user readme')
  }

  trackGoogleAnalyticsEvent('User', 'Update user readme', 'User readme update', {
    readme_tx: dataTxResponse.id
  })

  return dataTxResponse.id
}

export async function computeContributionsFromRepo(
  repos: Repo[],
  email: string = '',
  address: string,
  version: string = '1'
): Promise<UserContributionData> {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const userCommits: UserCommit[] = []
  const userPRs: UserPROrIssue[] = []
  const userIssues: UserPROrIssue[] = []

  for (const repo of repos) {
    const { name, description, id, dataTxId } = repo

    if ((!name && !description) || !id || !dataTxId) continue

    try {
      await unmountRepoFromBrowser(name)
    } catch (error) {
      //fail silently
      console.error(error)
    }

    try {
      const { response, error } = await withAsync(() => fetch(`https://arweave.net/${dataTxId}`))

      if (error || !response) continue

      const fs = fsWithName(name)
      const dir = `/${name}`

      const repoArrayBuf = await response.arrayBuffer()
      const success = await importRepoFromBlob(fs, dir, new Blob([repoArrayBuf]))
      await waitFor(1000)

      if (!success) continue

      const commits = await getAllCommits({ fs, dir })

      if (commits && commits.length > 0) {
        for (const commitObj of commits) {
          const authorEmail = commitObj.commit.author.email

          if (authorEmail === email || authorEmail === address) {
            const inputTags = [
              { name: 'App-Name', value: 'Protocol.Land' },
              { name: 'User', value: authorEmail },
              { name: 'Type', value: 'stats-commit' },
              { name: 'Repo', value: name },
              { name: 'Email', value: commitObj.commit.author.email },
              { name: 'Timestamp', value: commitObj.commit.committer.timestamp.toString() },
              { name: 'Timezone-Offset', value: commitObj.commit.committer.timezoneOffset.toString() },
              { name: 'Version', value: version }
            ]

            const userCommit: UserCommit = {
              email: commitObj.commit.author.email,
              timestamp: commitObj.commit.committer.timestamp,
              timezoneOffset: commitObj.commit.committer.timezoneOffset
            }

            const transaction = await arweave.createTransaction({
              data: 'stats-commit'
            })

            inputTags.forEach((tag) => transaction.addTag(tag.name, tag.value))

            const dataTxResponse = await window.arweaveWallet.dispatch(transaction)

            if (dataTxResponse.id) {
              userCommits.push(userCommit)
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      await unmountRepoFromBrowser(name)
    }

    if (repo.pullRequests) {
      for (const PR of repo.pullRequests) {
        if (PR.author === address) {
          const inputTags = [
            { name: 'App-Name', value: 'Protocol.Land' },
            { name: 'User', value: address },
            { name: 'Type', value: 'stats-pullrequest' },
            { name: 'Repo', value: name },
            { name: 'Timestamp', value: PR.timestamp.toString() },
            { name: 'Author', value: PR.author.toString() }
          ]

          const transaction = await arweave.createTransaction({
            data: 'stats-pullrequest'
          })

          inputTags.forEach((tag) => transaction.addTag(tag.name, tag.value))

          const dataTxResponse = await window.arweaveWallet.dispatch(transaction)

          if (dataTxResponse.id) {
            userPRs.push({
              author: PR.author,
              timestamp: PR.timestamp
            })
          }
        }
      }
    }

    if (repo.issues) {
      for (const issue of repo.issues) {
        if (issue.author === address) {
          const inputTags = [
            { name: 'App-Name', value: 'Protocol.Land' },
            { name: 'User', value: address },
            { name: 'Type', value: 'stats-issue' },
            { name: 'Repo', value: name },
            { name: 'Timestamp', value: issue.timestamp.toString() },
            { name: 'Author', value: issue.author.toString() }
          ]

          const transaction = await arweave.createTransaction({
            data: 'stats-issue'
          })

          inputTags.forEach((tag) => transaction.addTag(tag.name, tag.value))

          const dataTxResponse = await window.arweaveWallet.dispatch(transaction)

          if (dataTxResponse.id) {
            userIssues.push({
              author: issue.author,
              timestamp: issue.timestamp
            })
          }
        }
      }
    }
  }

  return { commits: userCommits, issues: userIssues, pullRequests: userPRs }
}

export async function queryAndTransformUserContributionData(address: string) {
  const queryObject = prepareUserContributionsQueryObject(address)

  const results = await arweave.api.post('/graphql', queryObject)

  if (results.data?.errors && results.data?.errors.length)
    return {
      commits: [],
      issues: [],
      pullRequests: []
    }

  const data = results.data?.data?.transactions?.edges ?? []

  const userContributionData = transformGQLResponseToContributionData(data)

  return userContributionData
}

export async function queryAndTransformRepoContributionData(name: string) {
  const queryObject = prepareRepoContributionsQueryObject(name)

  const results = await arweave.api.post('/graphql', queryObject)

  if (results.data?.errors && results.data?.errors.length)
    return {
      commits: [],
      issues: [],
      pullRequests: []
    }

  const data = results.data?.data?.transactions?.edges ?? []

  const repoContributionsData = transformGQLResponseToContributionData(data)

  return repoContributionsData
}

export function transformContributionData(statistics: UserContributionData): FormattedContribution[] {
  const data = [...statistics.commits, ...statistics.issues, ...statistics.pullRequests]

  const dateCountMap: Record<string, number> = {}

  data.forEach((item) => {
    const dateStr = timestampToDate(item.timestamp)
    if (!dateCountMap[dateStr]) {
      dateCountMap[dateStr] = 0
    }
    dateCountMap[dateStr]++
  })

  const transformedData = Object.entries(dateCountMap).map(([date, count]) => ({
    date,
    count
  }))

  return transformedData
}

export function getCurrentContributionStreak(contributions: FormattedContribution[]): ContributionStreak {
  // Ensure the list is sorted by date in ascending order
  contributions.sort((a, b) => a.date.localeCompare(b.date))

  let currentStreak = 0
  let streakEndDate: Date | null = null
  // Start from the most recent date and work backwards
  for (let i = contributions.length - 1; i >= 0; i--) {
    const currentDate = new Date(contributions[i].date)
    const previousDate = i > 0 ? new Date(contributions[i - 1].date) : null

    // If the count is greater than 0, it's a valid contribution day
    if (contributions[i].count > 0) {
      currentStreak++

      if (!streakEndDate) streakEndDate = currentDate
      // Check if the previous date was consecutive
      if (previousDate && !isConsecutiveDays(currentDate, previousDate)) {
        break // Streak has been broken
      }
    } else {
      break // No contributions for the day means the streak ends
    }
  }

  const recentContribution = contributions[contributions.length - 1].date
  const recentContributionIsToday = isToday(new Date(recentContribution))
  const today = new Date()

  if (isConsecutiveDays(today, streakEndDate!) || recentContributionIsToday) {
    // Continue the streak
  } else {
    // Reset the streak
    currentStreak = 0
    streakEndDate = null
  }

  const streakStartDate = streakEndDate ? add(streakEndDate, { days: -currentStreak + 1 }) : null

  return {
    start: streakStartDate ? format(streakStartDate, 'MMMM d, yyyy') : '',
    end: streakEndDate ? format(streakEndDate, 'MMMM d, yyyy') : '',
    days: currentStreak
  }
}

export async function postCommitStatDataTxToArweave({
  repoName,
  commit,
  version = '1'
}: PostStatDataTxToArweaveOptions) {
  const inputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'User', value: commit.author.email },
    { name: 'Type', value: 'stats-commit' },
    { name: 'Repo', value: repoName },
    { name: 'Email', value: commit.author.email },
    { name: 'Timestamp', value: commit.committer.timestamp.toString() },
    { name: 'Timezone-Offset', value: commit.committer.timezoneOffset.toString() },
    { name: 'Version', value: version }
  ]

  const transaction = await arweave.createTransaction({
    data: 'stats-commit'
  })

  inputTags.forEach((tag) => transaction.addTag(tag.name, tag.value))

  const dataTxResponse = await window.arweaveWallet.dispatch(transaction)

  if (!dataTxResponse.id) {
    return false
  }

  return true
}

export async function postPRStatDataTxToArweave(address: string, name: string, PR: PullRequest) {
  const inputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'User', value: address },
    { name: 'Type', value: 'stats-pullrequest' },
    { name: 'Repo', value: name },
    { name: 'Timestamp', value: PR.timestamp.toString() },
    { name: 'Author', value: PR.author.toString() }
  ]

  const transaction = await arweave.createTransaction({
    data: 'stats-pullrequest'
  })

  inputTags.forEach((tag) => transaction.addTag(tag.name, tag.value))

  const dataTxResponse = await window.arweaveWallet.dispatch(transaction)

  if (!dataTxResponse.id) {
    return false
  }

  return true
}

export async function postIssueStatDataTxToArweave(address: string, name: string, issue: Issue) {
  const inputTags = [
    { name: 'App-Name', value: 'Protocol.Land' },
    { name: 'User', value: address },
    { name: 'Type', value: 'stats-issue' },
    { name: 'Repo', value: name },
    { name: 'Timestamp', value: issue.timestamp.toString() },
    { name: 'Author', value: issue.author.toString() }
  ]

  const transaction = await arweave.createTransaction({
    data: 'stats-issue'
  })

  inputTags.forEach((tag) => transaction.addTag(tag.name, tag.value))

  const dataTxResponse = await window.arweaveWallet.dispatch(transaction)

  if (!dataTxResponse.id) {
    return false
  }

  return true
}

function isConsecutiveDays(date1: Date, date2: Date) {
  return isYesterday(date2) && date1.getTime() === date2.getTime() + 86400000
}

// Helper function to convert UNIX timestamp to 'YYYY-MM-DD' format
const timestampToDate = (timestamp: number | string) => {
  const date = fromUnixTime(+timestamp)
  const future = isFuture(date)

  if (future) {
    const updatedDate = fromUnixTime(+timestamp / 1000)

    return format(updatedDate, 'yyyy-MM-dd')
  }

  return format(date, 'yyyy-MM-dd')
}

const prepareUserContributionsQueryObject = (address: string) => {
  return {
    query: `
     {
      transactions(
        first: 100
        tags: [
          { name: "App-Name", values: "Protocol.Land" }
          { name: "User", values: "${address}" }
          { name: "Type", values: ["stats-issue", "stats-pullrequest", "stats-commit"] }
        ]
      ) {
        edges {
          node {
            ...TransactionCommon
          }
        }
      }
    }
    fragment TransactionCommon on Transaction {
      id
      owner {
        address
      }
      bundledIn {
        id
      }
      block {
        height
        timestamp
      }
      tags {
        name
        value
      }
    }
    `
  }
}

const prepareRepoContributionsQueryObject = (name: string) => {
  return {
    query: `
     {
      transactions(
        first: 100
        tags: [
          { name: "App-Name", values: "Protocol.Land" }
          { name: "Repo", values: "${name}" }
          { name: "Type", values: ["stats-issue", "stats-pullrequest", "stats-commit"] }
        ]
      ) {
        edges {
          node {
            ...TransactionCommon
          }
        }
      }
    }
    fragment TransactionCommon on Transaction {
      id
      owner {
        address
      }
      bundledIn {
        id
      }
      block {
        height
        timestamp
      }
      tags {
        name
        value
      }
    }
    `
  }
}

const gqlResponseTransformationHandlers: Record<string, (data: GQLEdge) => UserCommit | UserPROrIssue> = {
  'stats-commit': (data): UserCommit => ({
    email: getValueFromTags(data.node.tags, 'Email'),
    timestamp: getTimestampFromNode(data.node),
    timezoneOffset: parseInt(getValueFromTags(data.node.tags, 'Timezone-Offset'), 10)
  }),
  'stats-issue': (data): UserPROrIssue => ({
    author: getValueFromTags(data.node.tags, 'User'),
    timestamp: getTimestampFromNode(data.node)
  }),
  'stats-pullrequest': (data): UserPROrIssue => ({
    author: getValueFromTags(data.node.tags, 'User'),
    timestamp: getTimestampFromNode(data.node)
  })
}

function transformGQLResponseToContributionData(dataList: GQLEdge[]): UserContributionData {
  const result: UserContributionData = {
    commits: [],
    issues: [],
    pullRequests: []
  }

  for (const data of dataList) {
    const type = getValueFromTags(data.node.tags, 'Type')
    if (type && gqlResponseTransformationHandlers[type]) {
      if (type === 'stats-commit') result.commits.push(gqlResponseTransformationHandlers[type](data) as UserCommit)
      if (type === 'stats-issue') result.issues.push(gqlResponseTransformationHandlers[type](data) as UserPROrIssue)
      if (type === 'stats-pullrequest')
        result.pullRequests.push(gqlResponseTransformationHandlers[type](data) as UserPROrIssue)
    }
  }

  return result
}

function getValueFromTags(tags: Array<{ name: string; value: string }>, name: string) {
  const tag = tags.find((tag) => tag.name === name)

  return tag ? tag.value : ''
}

function getTimestampFromNode(node: GQLNode) {
  if (!node.block) return parseInt(getValueFromTags(node.tags, 'Timestamp'), 10)

  return node.block.timestamp
}

export type UserCommit = {
  email: string
  timestamp: number
  timezoneOffset: number
}

export type UserPROrIssue = {
  author: string
  timestamp: number
}

export type UserContributionData = {
  commits: UserCommit[]
  issues: UserPROrIssue[]
  pullRequests: UserPROrIssue[]
}

export type FormattedContribution = {
  date: string
  count: number
}

export type ContributionPercentages = {
  commits: string
  pullRequests: string
  issues: string
}

export type ContributionStreak = {
  start: string
  end: string
  days: number
}

export type PostStatDataTxToArweaveOptions = {
  repoName: string
  commit: CommitObject
  version?: string
}

type GQLEdge = {
  node: GQLNode
}

type GQLNode = {
  tags: Array<{ name: string; value: string }>
  block: GQLBlock
}

type GQLBlock = {
  height: number
  timestamp: number
}
