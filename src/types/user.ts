import { UserCommit, UserPROrIssue } from '@/lib/user'

export type User = {
  fullname?: string
  username?: string
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
}

export type Timezone = {
  value: string
  label: string
  offset: number
  abbrev: string
  altName: string
}
