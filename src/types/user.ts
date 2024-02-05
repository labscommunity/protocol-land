import { UserCommit, UserPROrIssue } from '@/lib/user'

export type User = {
  fullname?: string
  username?: string
  isUserNameArNS?: boolean
  avatar?: string
  //   timezone?: Timezone
  location?: string
  twitter?: string
  email?: string
  website?: string
  readmeTxId?: string
  statistics: {
    commits: UserCommit[]
    pullRequests: UserPROrIssue[]
    issues: UserPROrIssue[]
  }
  arNSNames: ArNSNames
}

export type ArNSNames = Record<string, ArNSName>

export type ArNSName = {
  contractTxId: string
  endTimestamp: number
  purchasePrice: number
  startTimestamp: number
  type: string
  undernames: number
}

export type Timezone = {
  value: string
  label: string
  offset: number
  abbrev: string
  altName: string
}
