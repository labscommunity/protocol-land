export type User = {
  fullname?: string
  username?: string
  avatar?: string
  bio?: string
//   timezone?: Timezone
  location?: string
  twitter?: string
  email?: string
  website?: string
  readmeTxId?: string
}

export type Timezone = {
  value: string
  label: string
  offset: number
  abbrev: string
  altName: string
}
