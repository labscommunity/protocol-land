import clsx from 'clsx'
import { format } from 'date-fns/esm'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { Hackathon, Submission } from '@/types/hackathon'

type Props = {
  selectedHackathon: Hackathon
}

export default function SubmissionsTab({ selectedHackathon }: Props) {
  const navigate = useNavigate()
  const submissions = selectedHackathon?.submissions ? Object.values(selectedHackathon.submissions) : []

  function getSubmissionBy(submission: Submission) {
    //
    if (!submission || !selectedHackathon) return null

    const result: {
      isTeam: boolean
      members: string[]
      teamName: string
    } = {
      isTeam: false,
      members: [],
      teamName: ''
    }

    const { submittedBy } = submission

    const participant = selectedHackathon.participants[submittedBy]

    if (participant.teamId) {
      const team = selectedHackathon.teams[participant.teamId]

      result.isTeam = true
      result.members.push(team.owner)
      result.members = team.members
      result.teamName = team.name
    } else {
      result.members.push(participant.address)
    }

    if (result.isTeam) {
      return <span className="font-semibold text-sm">{result.teamName}</span>
    }

    return <span className="font-semibold text-sm">{resolveUsernameOrShorten(result.members[0], 4)}</span>
  }

  function handleSubmissionViewClick(submission: Submission) {
    navigate(`/hackathon/${selectedHackathon.id}/submission/${submission.submittedBy}`)
  }

  return (
    <div className="flex flex-col w-full">
      {submissions.length === 0 && (
        <div className="w-full py-16 flex justify-center items-center">
          <h1 className="text-gray-600 text-2xl font-thin tracking-wider">No submissions at the moment</h1>
        </div>
      )}
      <div className="w-full flex flex-col">
        {submissions.map((submission, idx) => (
          <div
            key={idx + 1}
            className={clsx('flex w-full p-6 bg-white rounded-lg gap-1 border-[1px] border-gray-300', {
              'winner-sub-bg-gold text-white': submission.isWinner
            })}
          >
            <div className="w-[70%]">
              <div className="relative flex flex-col gap-1">
                <img
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null // prevents looping
                    currentTarget.src = 'https://placehold.co/500x500?text=LOGO'
                  }}
                  src={`${submission?.logo}`}
                  className="w-12 h-12 rounded-full"
                />
                <h1
                  className={clsx('text-lg font-medium', {
                    'text-gray-600': !submission.isWinner
                  })}
                >
                  {submission.projectName}
                </h1>
              </div>
              <div className="w-full flex flex-col">
                <div className="w-full flex flex-col gap-2">
                  <div className="relative flex items-center">
                    <p
                      className={clsx('text-sm whitespace-pre-line', {
                        'text-gray-600': !submission.isWinner
                      })}
                    >
                      {submission.shortDescription}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">By {getSubmissionBy(submission)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[30%] flex flex-col items-end ">
              <div className="flex flex-col">
                <span>Submitted on {format(+submission.timestamp, 'MMM dd, yyyy')}</span>
              </div>
              <div onClick={() => handleSubmissionViewClick(submission)} className="flex flex-1 items-center">
                <Button
                  className="h-[35px] text-white "
                  variant={submission.isWinner ? 'primary-solid' : 'primary-solid'}
                >
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
