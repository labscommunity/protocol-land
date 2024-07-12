import { v4 } from 'uuid'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { getSigner } from '@/helpers/wallet/getSigner'
import { Hackathon, NewHackatonItem, Team } from '@/types/hackathon'

export async function getAllHackathons(): Promise<Hackathon[]> {
  const contract = await getWarpContract(CONTRACT_TX_ID)

  const {
    cachedValue: {
      state: { hackathons }
    }
  } = await contract.readState()

  if (!hackathons) return []

  if (Object.keys(hackathons).length === 0) {
    return []
  }

  const hackathonsList = []

  for (const hackId in hackathons) {
    const hackathon = hackathons[hackId]

    hackathonsList.push(hackathon)
  }

  return hackathonsList
}

export async function getHackathonById(id: string): Promise<Hackathon | null> {
  const contract = await getWarpContract(CONTRACT_TX_ID)

  const {
    cachedValue: {
      state: { hackathons }
    }
  } = await contract.readState()

  const hackathon = hackathons[id]

  if (!hackathon) {
    return null
  }

  return hackathon
}

export async function postNewHackathon(hackathon: NewHackatonItem): Promise<void> {
  const userSigner = await getSigner()

  const contract = await getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'createNewHackathon',
    payload: hackathon
  })
}

export async function postUpdatedHackathon(hackathon: Partial<Hackathon>): Promise<void> {
  const userSigner = await getSigner()

  const contract = await getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'updateHackathon',
    payload: hackathon
  })
}

export async function participate(hackathonId: string, teamId?: string): Promise<void> {
  const userSigner = await getSigner()

  const contract = await getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'participateInHackathon',
    payload: {
      id: hackathonId,
      teamId
    }
  })
}

export async function createHackathonTeam(payload: CreateHackathonTeam): Promise<Team> {
  const id = v4()
  const userSigner = await getSigner()

  const contract = await getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'createHackathonTeam',
    payload: { ...payload, id }
  })

  const {
    cachedValue: {
      state: { hackathons }
    }
  } = await contract.readState()

  const hackathon = hackathons[payload.hackathonId] as Hackathon

  return hackathon.teams[id]
}

type CreateHackathonTeam = {
  hackathonId: string
  name: string
  members: string[]
}
