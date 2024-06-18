import { formatDistanceToNow } from 'date-fns'
import React from 'react'
import { GoRepoForked } from 'react-icons/go'
import { RiGitRepositoryFill } from 'react-icons/ri'
import { Link } from 'react-router-dom'

import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { ActivityRepo } from '@/types/explore'

import Popover from './Popover'

interface RepoPopoverProps {
  repo: ActivityRepo
  children: React.ReactNode
}

export default function RepoPopover({ repo, children }: RepoPopoverProps) {
  const PopoverContent = () => {
    return (
      <div className="relative flex flex-col gap-2 bg-white p-4">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <div>
              <RiGitRepositoryFill className="w-5 h-5 text-inherit" />
            </div>
            <Link
              to={`/repository/${repo.id}`}
              className="flex gap-1 items-center font-medium hover:underline hover:text-primary-700 break-all"
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
            <span className="text-gray-600">{repo.forks}</span>
            <GoRepoForked />
          </div>
          {repo.updatedTimestamp && (
            <span className="text-gray-600">
              Updated {formatDistanceToNow(new Date(repo.updatedTimestamp), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    )
  }

  return <Popover triggerElement={children} ContentComponent={PopoverContent} />
}
