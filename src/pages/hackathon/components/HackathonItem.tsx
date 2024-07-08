import clsx from 'clsx'
import React from 'react'
import { FaDotCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

import { Hackathon } from '@/types/hackathon'

import { getHackathonStatus } from '../utils/getHackathonStatus'

type Props = {
  details: Hackathon
}

export default function HackathonItem({ details }: Props) {
  const navigate = useNavigate()
  const [status, setStatus] = React.useState('NOT_STARTED')

  const statusText = React.useMemo<string>(() => getHackathonStatus(details.startsAt, details.endsAt, setStatus), [])

  return (
    <div className="flex flex-col border-gray-300 border-[1px] w-full rounded-t-lg bg-white overflow-hidden">
      <div className="flex w-full bg-gray-200 py-[10px] px-4 justify-between">
        <div className="flex items-center gap-2">
          <FaDotCircle
            className={clsx({
              'w-4 h-4': true,
              'text-success-600': status === 'RUNNING',
              'text-red-600': status === 'ENDED',
              'text-gray-600': status === 'NOT_STARTED'
            })}
          />
          <span className="text-gray-900 font-medium text-sm">{statusText?.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1">
          <h1 className="text-gray-900 font-medium text-sm">Hackathon</h1>
          <span>|</span>
          <h1 className="text-gray-900 font-medium text-sm">{details.location}</h1>
        </div>
      </div>
      <div className="flex flex-col w-full bg-white py-[10px] px-4 gap-4">
        <div className="w-full flex justify-between">
          <div className="flex items-center gap-2">
            <img src={'https://arweave.net/' + details.hackathonLogo} className="w-6 h-6 rounded-full" />
            <h1
              onClick={() => navigate(`/hackathon/${details.id}`)}
              className="font-medium text-gray-900 hover:underline hover:cursor-pointer"
            >
              {details.title}
            </h1>
          </div>
          <div className="flex">
            <h1 className="font-medium text-gray-900">
              ${details.totalRewards} in {details.totalRewardsBase}
            </h1>
          </div>
        </div>
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            {details.tags.map((tag) => (
              <div className="flex px-4 py-[1px] items-center bg-primary-600 rounded-full text-white">{tag}</div>
            ))}
          </div>
          <div className="flex gap-1 text-sm items-center">
            <h1>Hosted by </h1>
            <span className="flex items-center gap-1">
              <img src={'https://arweave.net/' + details.hostLogo} className="w-4 h-4 rounded-full" />
              <h1 className="font-semibold">{details.hostedBy}</h1>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
