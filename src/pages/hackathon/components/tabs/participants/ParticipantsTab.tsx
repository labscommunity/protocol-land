import { formatDistanceToNow } from 'date-fns/esm'
import { FiGitCommit } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { Hackathon } from '@/types/hackathon'

type Props = {
  selectedHackathon: Hackathon
}
export default function ParticipantsTab({ selectedHackathon }: Props) {
  const participants = Object.values(selectedHackathon?.participants || {})

  function getTeamName(teamId: string | undefined) {
    if (!teamId) return null

    const teams = selectedHackathon.teams
    const team = teams[teamId]

    return team.name
  }
  return (
    <div className="flex flex-col w-full">
      {participants.length === 0 && (
        <div className="w-full py-16 flex justify-center items-center">
          <h1 className="text-gray-600 text-2xl font-thin tracking-wider">No participants at the moment</h1>
        </div>
      )}
      {participants.map((participant) => (
        <div className="w-full py-2 flex gap-4 relative items-center before:bg-gray-300 before:content-[''] before:absolute before:left-0 before:top-0 before:w-[2px] before:h-full before:block">
          <div className="ml-2 z-[1] relative">
            <FiGitCommit className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-between flex-1 border-[1px] border-gray-300 bg-gray-200 rounded-lg w-full px-4 py-2">
            <div className="inline-block text-gray-600">
              <Link
                to={`/user/${participant.address}`}
                className="font-medium cursor-pointer hover:underline hover:text-primary-700"
              >
                {resolveUsernameOrShorten(participant.address)}
              </Link>
              <span>
                {' '}
                has joined {participant.teamId && (
                  <span className="font-bold">{getTeamName(participant.teamId)}</span>
                )}{' '}
              </span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(participant.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
