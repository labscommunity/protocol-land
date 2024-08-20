import clsx from 'clsx'
import { format } from 'date-fns/esm'
import { GiLaurelsTrophy } from 'react-icons/gi'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { useGlobalStore } from '@/stores/globalStore'
import { Hackathon, Submission } from '@/types/hackathon'

type Props = {
  selectedHackathon: Hackathon
}

export default function SubmissionsTab({ selectedHackathon }: Props) {
  const navigate = useNavigate()
  const address = useGlobalStore((state) => state.authState.address)
  const submissions = selectedHackathon?.submissions ? Object.values(selectedHackathon.submissions) : []
  const participant = selectedHackathon?.participants ? selectedHackathon.participants[address!] : null
  const publishedSubmissions = submissions.filter((submission) => submission.status === 'PUBLISHED')
  const draftSubmissions = submissions.filter((submission) =>
    submission.status === 'DRAFT' && participant?.teamId
      ? participant.teamId === submission.submittedBy
      : participant?.address === submission.submittedBy
  )
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
    const participant = Object.values(selectedHackathon.participants).find(
      (participant) => participant.address === submittedBy || participant?.teamId === submittedBy
    )

    if (!participant) return null

    if (participant?.teamId) {
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

  function handleSubmissionEditClick() {
    navigate(`/hackathon/${selectedHackathon.id}/submit`)
  }

  function getPrizeById(id: string) {
    return selectedHackathon.prizes[id]
  }

  function handlePrizeTabRedirection() {
    navigate(`/hackathon/${selectedHackathon.id}/prizes`)
  }

  return (
    <div className="flex flex-col w-full">
      {draftSubmissions.length > 0 && (
        <div className="w-full flex flex-col gap-3 border-b-[1px] mb-6 border-b-gray-200 pb-6">
          <h1 className="text-xl font-medium text-gray-600">My Submission Draft</h1>
          {draftSubmissions.map((submission, idx) => (
            <div
              key={idx + 1}
              className={clsx('flex w-full p-6 bg-white rounded-lg gap-1 border-[1px] border-gray-300')}
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
                  <h1 className={clsx('text-lg font-medium text-gray-600')}>
                    {submission?.projectName || 'No project name'}
                  </h1>
                </div>
                <div className="w-full flex flex-col">
                  <div className="w-full flex flex-col gap-2">
                    <div className="relative flex justify-center flex-col">
                      <p
                        className={clsx('text-sm whitespace-pre-line text-gray-600')}
                        style={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {submission?.shortDescription || 'No short description'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">By {getSubmissionBy(submission)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[30%] flex flex-col items-end gap-1">
                <div onClick={() => handleSubmissionEditClick()} className="flex flex-1 items-center">
                  <Button variant={'primary-solid'}>Edit</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {publishedSubmissions.length === 0 && (
        <div className="w-full py-16 flex justify-center items-center">
          <h1 className="text-gray-600 text-2xl font-thin tracking-wider">No submissions at the moment</h1>
        </div>
      )}
      <div className="w-full flex flex-col gap-4">
        {publishedSubmissions.map((submission, idx) => (
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
                  <div className="relative flex justify-center flex-col">
                    <p
                      className={clsx('text-sm whitespace-pre-line', {
                        'text-gray-600': !submission.isWinner
                      })}
                      style={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {submission?.shortDescription || 'No short description'}
                    </p>
                    {submission?.shortDescription?.length > 100 && ( // Adjust the length check as needed
                      <Link
                        to={`/hackathon/${selectedHackathon.id}/submission/${submission.submittedBy}`}
                        className="text-primary-700 font-medium hover:underline text-sm"
                      >
                        Read more
                      </Link>
                    )}
                  </div>
                  <div>
                    <p className="text-sm">By {getSubmissionBy(submission)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[30%] flex flex-col items-end gap-1">
              <div className="flex flex-col gap-1">
                {submission?.prizeIds.map((prizeId) => {
                  const prize = getPrizeById(prizeId)
                  if (!prize) return null
                  return (
                    <div
                      onClick={handlePrizeTabRedirection}
                      style={{
                        border: '1px solid #caa173',
                        background: ``,
                        boxShadow:
                          '2px 2px 0.5em rgba(155, 122, 89, 0.55),inset 1px 1px 0 rgba(255, 255, 255, 0.9),inset -1px -1px 0 rgba(0, 0, 0, 0.5)'
                      }}
                      className="border-[1px] cursor-pointer border-white text-white font-medium text-base rounded-[64px] px-4 py-[2px] flex items-center gap-1"
                    >
                      <GiLaurelsTrophy className="text-white w-4 h-4" />
                      {prize.name}
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-col">
                <span>Submitted on {format(+submission.timestamp, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex flex-1 items-center gap-4">
                {submission.submittedBy &&
                  (submission.submittedBy === participant?.address ||
                    submission.submittedBy === participant?.teamId) && (
                    <Button
                      onClick={() => handleSubmissionEditClick()}
                      style={{
                        boxShadow: submission.isWinner
                          ? '2px 2px 0.5em rgba(155, 122, 89, 0.55),inset 1px 1px 0 rgba(255, 255, 255, 0.9),inset -1px -1px 0 rgba(0, 0, 0, 0.5)'
                          : undefined
                      }}
                      className={
                        submission.isWinner
                          ? 'h-[35px] text-white bg-transparent font-medium hover:bg-transparent'
                          : undefined
                      }
                      variant={'primary-solid'}
                    >
                      Edit
                    </Button>
                  )}
                <Button
                  onClick={() => handleSubmissionViewClick(submission)}
                  style={{
                    boxShadow: submission.isWinner
                      ? '2px 2px 0.5em rgba(155, 122, 89, 0.55),inset 1px 1px 0 rgba(255, 255, 255, 0.9),inset -1px -1px 0 rgba(0, 0, 0, 0.5)'
                      : undefined
                  }}
                  className={
                    submission.isWinner
                      ? 'h-[35px] text-white bg-transparent font-medium hover:bg-transparent'
                      : undefined
                  }
                  variant={'primary-solid'}
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
