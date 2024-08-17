import { dryrun } from '@permaweb/aoconnect'
import { v4 } from 'uuid'

import { AOS_PROCESS_ID } from '@/helpers/constants'
import { getTags } from '@/helpers/getTags'
import { sendMessage } from '@/lib/contract'
import { Hackathon, NewHackatonItem, Team } from '@/types/hackathon'

export async function getAllHackathons(): Promise<Hackathon[]> {
  const args = {
    tags: getTags({
      Action: 'Get-All-Hackathons'
    })
  } as any
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    ...args
  })

  const hackathons = JSON.parse(Messages[0].Data) as Hackathon[]

  if (!hackathons) return []

  return hackathons
}

export async function getHackathonById(id: string): Promise<Hackathon | null> {
  const args = {
    tags: getTags({
      Action: 'Get-Hackathon-By-Id',
      Id: id
    })
  } as any

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    ...args
  })

  const hackathon = JSON.parse(Messages[0].Data) as Hackathon

  if (!hackathon) {
    return null
  }

  return hackathon
}

export async function postNewHackathon(hackathon: NewHackatonItem): Promise<void> {
  const args = {
    tags: getTags({
      Action: 'Create-Hackathon'
    }),
    data: JSON.stringify(hackathon)
  } as any

  await sendMessage(args)
}

export async function postUpdatedHackathon(hackathon: Partial<Hackathon>): Promise<void> {
  const args = {
    tags: getTags({
      Action: 'Update-Hackathon'
    }),
    data: JSON.stringify(hackathon)
  } as any

  await sendMessage(args)
}

export async function participate(hackathonId: string, teamId?: string): Promise<void> {
  const args = {
    tags: {
      Action: 'Participate-In-Hackathon',
      Id: hackathonId
    }
  } as any

  if (teamId) {
    args.tags['Team-Id'] = teamId
  }

  args.tags = getTags(args.tags)

  await sendMessage(args)
}

export async function selectPrizeWinner(
  hackathonId: string,
  prizeId: string,
  participantAddress: string
): Promise<void> {
  const args = {
    tags: getTags({
      Action: 'Post-Hackathon-Judgement',
      Id: hackathonId,
      'Prize-Id': prizeId,
      'Participant-Address': participantAddress
    })
  } as any

  await sendMessage(args)
}

export async function createHackathonTeam(payload: CreateHackathonTeam): Promise<Team> {
  const id = v4()
  const args = {
    tags: getTags({
      Action: 'Create-Hackathon-Team',
      Id: id,
      Name: payload.name,
      'Hackathon-Id': payload.hackathonId,
      Members: JSON.stringify(payload.members)
    })
  } as any

  await sendMessage(args)

  const hackathon = await getHackathonById(payload.hackathonId)

  if (!hackathon) {
    throw new Error('Hackathon not found')
  }

  return hackathon.teams[id]
}

type CreateHackathonTeam = {
  hackathonId: string
  name: string
  members: string[]
}
