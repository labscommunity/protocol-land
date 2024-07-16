import { BountyBase } from './repository'

export type Hackathons = Record<string, Hackathon>

export type NewHackatonItem = {
  id: string
  hackathonLogo: string
  title: string
  shortDescription: string
  descriptionTxId: string
  prizes: Record<string, Prize>
  totalRewardsBase: string
  totalRewards: number
  startsAt: number
  endsAt: number
  hostLogo: string
  hostedBy: string
  location: string
  tags: Array<string>
}

export type Hackathon = {
  id: string
  timestamp: number
  createdBy: string
  hackathonLogo: string
  title: string
  shortDescription: string
  descriptionTxId: string
  prizes: Record<string, Prize>
  totalRewardsBase: BountyBase
  totalRewards: number
  startsAt: number
  endsAt: number
  hostLogo: string
  hostedBy: string
  location: string
  tags: Array<string>
  teams: Record<string, Team> //uuid <> Team
  participants: Record<string, Participant> // address <> Participant
  submissions: Record<string, Submission> // teamid/address <> submission
}

export type Team = {
  id: string
  name: string
  members: Array<string>
  owner: string
  timestamp: string
}

export type Participant = {
  address: string
  timestamp: number
  teamId?: string
}

export type Submission = {
  logo: string
  projectName: string
  shortDescription: string
  descriptionTxId: string
  technologiesUsed: string
  submittedBy: string //teamid or individual address
  images: string[]
  links: string[]
  video: string
  timestamp: number
  isWinner: boolean
  prizeIds: string[]
}

export type Prize = {
  id: string
  name: string
  description: string
  amount: number
  base: string
  winningParticipantsCount: number
}
