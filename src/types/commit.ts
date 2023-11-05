export type CommitResult = {
  oid: string // SHA-1 object id of this commit
  commit: CommitObject // the parsed commit object
  payload: string // PGP signing payload
}

export type CommitObject = {
  message: string // Commit message
  tree: string // SHA-1 object id of corresponding file tree
  parent: Array<string> // an array of zero or more SHA-1 object ids
  author: {
    name: string // The author's name
    email: string // The author's email
    timestamp: number // UTC Unix timestamp in seconds
    timezoneOffset: number // Timezone difference from UTC in minutes
  }
  committer: {
    name: string // The committer's name
    email: string // The committer's email
    timestamp: number // UTC Unix timestamp in seconds
    timezoneOffset: number // Timezone difference from UTC in minutes
  }
  gpgsig?: string // PGP signature (if present)
}
