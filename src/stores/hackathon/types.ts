import { Hackathon, NewHackatonItem } from '@/types/hackathon'

export interface HackathonSlice {
  hackathonState: HackathonState
  hackathonActions: HackathonActions
}

export type HackathonState = {
  status: ApiStatus
  error: unknown | null
  hackathons: Hackathon[]
  selectedHackathon: Hackathon | null
}

export type HackathonActions = {
  fetchAllHackathons: () => Promise<void>
  fetchHackathonById: (id: string) => Promise<void>
  createNewHackathon: (hackathon: NewHackatonItem) => Promise<void>
  setSelectedHackathon: (hackathon: Hackathon) => void
  participateInHackathon: (id: string) => Promise<void>
}
