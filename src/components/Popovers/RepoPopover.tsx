import { arrow, flip, offset, useFloating } from '@floating-ui/react-dom'
import { Popover } from '@headlessui/react'
import clsx from 'clsx'
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
  const arrowRef = React.useRef(null)
  const {
    refs,
    floatingStyles,
    placement,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} }
  } = useFloating({
    placement: 'top-start',
    middleware: [offset(5), flip(), arrow({ element: arrowRef })]
  })

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

  const staticSide: any = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
  }[placement.split('-')[0]]

  return (
    <Popover as="span">
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
              className="w-[22rem] max-w-sm px-4 sm:px-0"
              static
            >
              <div className="overflow-hidden rounded-lg border border-gray-300">
                <div className="relative flex flex-col gap-2 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <RiGitRepositoryFill className="w-5 h-5 text-inherit" />
                      <Link
                        to={`/repository/${repo.id}`}
                        className="flex gap-1 items-center font-medium hover:underline hover:text-primary-700"
                      >
                        {resolveUsernameOrShorten(repo.owner)}/{repo.name}
                      </Link>
                    </div>
                    <span className={`border-[1px] border-primary-600 text-primary-600 rounded-full px-2 text-sm`}>
                      {repo.private ? 'Private' : 'Public'}
                    </span>
                  </div>
                  {repo.parentRepo && (
                    <span className="text-sm text-gray-600">
                      Forked from{' '}
                      <Link to={`/repository/${repo.parentRepo.id}`} className="underline hover:text-primary-700">
                        {resolveUsernameOrShorten(repo.parentRepo.owner)}/{repo.parentRepo.name}
                      </Link>{' '}
                    </span>
                  )}
                  <span className="text-gray-600">{repo.description}</span>
                  <div className="flex text-sm gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">{Object.keys(repo.forks).length}</span>
                      <GoRepoForked />
                    </div>
                    {repo.updatedTimestamp && (
                      <span className="text-gray-600">
                        Updated {formatDistanceToNow(new Date(repo.updatedTimestamp), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div
                ref={arrowRef}
                style={{
                  left: arrowX != null ? `${arrowX}px` : '',
                  top: arrowY != null ? `${arrowY}px` : '',
                  [staticSide]: '-5px'
                }}
                className={clsx(
                  'bg-gray-50 absolute h-[10px] w-[10px] shadow-lg border border-gray-300 rotate-45',
                  staticSide === 'bottom' ? 'border-l-0 border-t-0' : 'border-r-0 border-b-0'
                )}
              ></div>
            </Popover.Panel>
          )}
        </>
      )}
    </Popover>
  )
}
