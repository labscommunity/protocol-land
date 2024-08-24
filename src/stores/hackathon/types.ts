import { Hackathon, NewHackatonItem, Participant, Submission, Team } from '@/types/hackathon'

export interface HackathonSlice {
  hackathonState: HackathonState
  hackathonActions: HackathonActions
}

export type HackathonState = {
  status: ApiStatus
  error: unknown | null
  hackathons: Hackathon[]
  selectedHackathon: Hackathon | null
  selectedSubmission: Partial<Submission> | null
  participant: Partial<Participant> | null
}

export type HackathonActions = {
  fetchAllHackathons: () => Promise<void>
  fetchHackathonById: (id: string) => Promise<void>
  createNewHackathon: (hackathon: NewHackatonItem) => Promise<void>
  setSelectedHackathon: (hackathon: Hackathon) => void
  participateInHackathon: (id: string, teamId?: string) => Promise<void>
  updateHackathon: (hackathon: Partial<Hackathon>) => Promise<void>
  createNewTeam: (name: string) => Promise<void | Team>
  assignPrizeToSubmission: (hackathonId: string, prizeId: string, participantAddress: string) => Promise<boolean | void>
  fetchHackathonSubmission: (hackathonId: string) => Promise<void>
  saveSubmission: (hackathonId: string, submission: Partial<Submission>, publish?: boolean) => Promise<void>
  publishSubmission: (hackathonId: string) => Promise<void>
  resetSelectedSubmission: () => void
  isParticipant: () => Promise<boolean>
  setParticipant: () => void
  isTeamOwner: () => boolean
}
