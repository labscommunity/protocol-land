import { useFloating } from '@floating-ui/react-dom'
import { Popover } from '@headlessui/react'
import React, { useState } from 'react'
import { BsFillPersonFill } from 'react-icons/bs'
import { TiLocation } from 'react-icons/ti'
import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { useGlobalStore } from '@/stores/globalStore'
import { User } from '@/types/user'

interface RepoPopoverProps {
  userAddress: string
  children: React.ReactNode
}

export default function UserPopover({ userAddress, children }: RepoPopoverProps) {
  const [allUsers] = useGlobalStore((state) => [state.userState.allUsers])
  const [isOpen, setIsOpen] = React.useState(false)
  const timeout = React.useRef<NodeJS.Timeout>()
  const { refs, floatingStyles } = useFloating({ placement: 'top-start' })
  const [user, setUser] = useState<User>()

  function clearCurrentTimeout() {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
  }

  function openPopover() {
    clearCurrentTimeout()
    if (!user) {
      setUser(allUsers.get(userAddress))
    }
    setIsOpen(true)
  }

  function closePopover() {
    timeout.current = setTimeout(() => {
      setIsOpen(false)
      clearCurrentTimeout()
    }, 100)
  }

  return (
    <Popover>
      {() => (
        <>
          <Popover.Button
            ref={refs.setReference}
            onMouseEnter={() => openPopover()}
            onMouseLeave={() => closePopover()}
          >
            {children}
          </Popover.Button>

          {isOpen && (
            <Popover.Panel
              ref={refs.setFloating}
              onMouseEnter={openPopover}
              onMouseLeave={closePopover}
              style={floatingStyles}
              className="w-[20rem] max-w-sm px-4 sm:px-0"
              static
            >
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                <div className="relative flex flex-col gap-2 bg-gray-50 p-4">
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
              </div>
              <svg className="absolute text-white h-2 left-0 ml-3 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
              </svg>
            </Popover.Panel>
          )}
        </>
      )}
    </Popover>
  )
}
