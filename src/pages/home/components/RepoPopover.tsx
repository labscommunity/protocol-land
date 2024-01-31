import { useFloating } from '@floating-ui/react-dom'
import { Popover } from '@headlessui/react'
import { formatDistanceToNow } from 'date-fns'
import React from 'react'
import { GoRepoForked } from 'react-icons/go'
import { RiGitRepositoryFill } from 'react-icons/ri'
import { Link } from 'react-router-dom'

import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { RepoWithParent } from '@/types/repository'

interface RepoPopoverProps {
  repo: RepoWithParent
  children: React.ReactNode
}

export default function RepoPopover({ repo, children }: RepoPopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const timeout = React.useRef<NodeJS.Timeout>()
  const { refs, floatingStyles } = useFloating({ placement: 'top-start' })

  function clearCurrentTimeout() {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
  }

  function openPopover() {
    clearCurrentTimeout()
    setIsOpen(true)
  }

  function closePopover() {
    timeout.current = setTimeout(() => {
      setIsOpen(false)
      clearCurrentTimeout()
    }, 100)
  }

  return (
    <div className="w-full">
      <Popover className="relative">
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
                className="w-max max-w-md px-4 sm:px-0"
                static
              >
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                  <div className="relative flex flex-col gap-2 bg-white p-4">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <RiGitRepositoryFill className="w-5 h-5 text-inherit" />
                        <Link
                          to={`/repository/${repo.id}`}
                          className="flex gap-1 items-center text-gray-600 hover:underline hover:text-primary-700"
                        >
                          {resolveUsernameOrShorten(repo.owner)}/{repo.name}
                        </Link>
                      </div>
                      <span className={`border-[1px] border-primary-600 text-primary-600 rounded-full px-2 text-sm`}>
                        {repo.private ? 'Private' : 'Public'}
                      </span>
                    </div>
                    {repo.parentRepo && (
                      <span className="text-sm">
                        Forked from{' '}
                        <Link
                          to={`/repository/${repo.parentRepo.id}`}
                          className="text-gray-600 underline hover:text-primary-700"
                        >
                          {resolveUsernameOrShorten(repo.parentRepo.owner)}/{repo.parentRepo.name}
                        </Link>{' '}
                      </span>
                    )}
                    <span>{repo.description}</span>
                    <div className="flex text-sm gap-2">
                      <div className="flex items-center gap-1">
                        {Object.keys(repo.forks).length}
                        <GoRepoForked />
                      </div>
                      {repo.updatedTimestamp && (
                        <span>Updated {formatDistanceToNow(new Date(repo.updatedTimestamp), { addSuffix: true })}</span>
                      )}
                    </div>
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
    </div>
  )
}
