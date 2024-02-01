import React, { useState } from 'react'
import { BsFillPersonFill } from 'react-icons/bs'
import { TiLocation } from 'react-icons/ti'
import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { useGlobalStore } from '@/stores/globalStore'
import { User } from '@/types/user'

import Popover from './Popover'

interface RepoPopoverProps {
  userAddress: string
  children: React.ReactNode
}

export default function UserPopover({ userAddress, children }: RepoPopoverProps) {
  const [allUsers] = useGlobalStore((state) => [state.userState.allUsers])
  const [user, setUser] = useState<User>()

  function openCallback() {
    if (!user) {
      setUser(allUsers.get(userAddress))
    }
  }

  return (
    <Popover PopoverTrigger={children} openCallback={openCallback}>
      <div className="relative flex flex-col gap-2 bg-white p-4">
        <div className="flex">
          {!user?.avatar && (
            <div className="rounded-full bg-gray-400 h-12 w-12 flex items-center justify-center">
              <BsFillPersonFill className="w-8 h-8 text-white" />
            </div>
          )}
          {user?.avatar && (
            <img src={`https://arweave.net/${user.avatar}`} className="rounded-full h-12" alt="profile-pic" />
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          <Link to={`/user/${userAddress}`} className="font-medium hover:underline hover:text-primary-700">
            {user?.username}
          </Link>
          <Link to={`/user/${userAddress}`} className="text-gray-600 hover:underline hover:text-primary-700">
            {user?.fullname}
          </Link>
        </div>
        <span>{shortenAddress(userAddress, 12)}</span>
        {user?.location && (
          <div className="flex gap-1 items-center">
            <TiLocation className="w-5 h-5" />
            <span className="text-gray-600">{user.location}</span>
          </div>
        )}
      </div>
    </Popover>
  )
}
