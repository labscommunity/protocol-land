import React from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { shortenAddress } from '@/helpers/shortenAddress'
import { useGlobalStore } from '@/stores/globalStore'
import { Repo } from '@/types/repository'

export default function AcceptInvite({ repo }: { repo: Repo | null }) {
  const [isAcceptLoading, setAcceptIsLoading] = React.useState(false)
  const [isRejectLoading, setIsRejectLoading] = React.useState(false)
  const [status, setStatus] = React.useState('IDLE')
  const [acceptContributor, rejectContributor] = useGlobalStore((state) => [
    state.repoCoreActions.acceptContributor,
    state.repoCoreActions.rejectContributor
  ])

  async function handleAcceptInviteClick() {
    setAcceptIsLoading(true)
    await acceptContributor()
    setAcceptIsLoading(false)
    setStatus('SUCCESS')
  }

  async function handleDeclineInviteClick() {
    //
    setIsRejectLoading(true)
    await rejectContributor()
    setIsRejectLoading(true)
    setStatus('REJECTED')
  }

  if (status === 'SUCCESS' && repo) {
    return (
      <div className="flex justify-center h-screen">
        <div className="text-center mt-[20vh] w-[500px]">
          <p className="text-2xl text-gray-600 mb-8">
            You've successfully accepted the invite to collaborate on{' '}
            <b>
              <i>{repo.name}</i>
            </b>
          </p>
          <p className="text-gray-500 mb-4">Please wait while admin grant you access.</p>
        </div>
      </div>
    )
  }

  if (status === 'REJECTED' && repo) {
    return (
      <div className="flex justify-center h-screen">
        <div className="text-center mt-[20vh] w-[500px]">
          <p className="text-2xl text-gray-600 mb-8">
            You've successfully rejected the invite to collaborate on{' '}
            <b>
              <i>{repo.name}</i>
            </b>
          </p>
        </div>
      </div>
    )
  }

  if (repo) {
    return (
      <div className="flex justify-center h-screen">
        <div className="text-center mt-[20vh] w-[500px]">
          <p className="text-2xl text-gray-600 mb-8">
            You've been invited by{' '}
            <span className="text-primary-600 hover:underline">
              <Link to={`/user/${repo.owner}`}>{shortenAddress(repo.owner, 6)}</Link>
            </span>{' '}
            to collaborate on{' '}
            <b>
              <i>{repo.name}</i>
            </b>
          </p>
          <p className="text-gray-500 mb-4">You can accept or decline this invitation.</p>
          <div className="flex justify-center mt-3 gap-3">
            <Button
              isLoading={isRejectLoading}
              disabled={isRejectLoading}
              variant="primary-outline"
              className="px-16 justify-center"
              onClick={handleDeclineInviteClick}
            >
              Decline
            </Button>
            <Button
              isLoading={isAcceptLoading}
              disabled={isAcceptLoading}
              variant="primary-solid"
              className="px-16 justify-center"
              onClick={handleAcceptInviteClick}
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
