import { formatDistanceToNow } from 'date-fns'
import React from 'react'
import { FiGitBranch, FiGitCommit } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { useGlobalStore } from '@/stores/globalStore'
import { ForksMetaData } from '@/stores/repository-core/types'

export default function ForksTab() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(true)
  const [userRepo, forksMetaData, fetchForkMetaData] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreState.selectedRepo.forksMetaData,
    state.repoCoreActions.fetchForkMetaData
  ])

  React.useEffect(() => {
    if (userRepo && forksMetaData.length === 0) {
      getForkReposMetaInfo()
    }
  }, [userRepo])

  async function getForkReposMetaInfo() {
    setIsLoading(true)

    await fetchForkMetaData()

    setIsLoading(false)
  }

  function handleForkClick(fork: ForksMetaData) {
    navigate(`/repository/${fork.id}`)
  }

  function handleUserClick(fork: ForksMetaData) {
    navigate(`/user/${fork.owner}`)
  }

  if (isLoading) {
    return (
      <div className="h-full w-full px-2 py-2 flex flex-col">
        <div className="w-full py-2 flex gap-4 relative items-center before:bg-gray-300 before:content-[''] before:absolute before:left-0 before:top-0 before:w-[2px] before:h-full before:block">
          <div className="ml-2 z-[1] relative">
            <FiGitCommit className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-between items-center flex-1 border-[1px] border-gray-300 bg-gray-200 rounded-lg w-full px-4 py-2">
            <div className="flex gap-6 items-center py-1 w-full">
              <div className="h-3 w-60 bg-gray-200 rounded-full dark:bg-gray-400 animate-pulse"></div>
              <div className="w-[1px] h-full bg-gray-400" />
              <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-400 w-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="w-full py-2 flex gap-4 relative items-center before:bg-gray-300 before:content-[''] before:absolute before:left-0 before:top-0 before:w-[2px] before:h-full before:block">
          <div className="ml-2 z-[1] relative">
            <FiGitCommit className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-between items-center flex-1 border-[1px] border-gray-300 bg-gray-200 rounded-lg w-full px-4 py-2">
            <div className="flex gap-6 items-center py-1 w-full">
              <div className="h-3 w-60 bg-gray-200 rounded-full dark:bg-gray-400 animate-pulse"></div>
              <div className="w-[1px] h-full bg-gray-400" />
              <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-400 w-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="w-full py-2 flex gap-4 relative items-center before:bg-gray-300 before:content-[''] before:absolute before:left-0 before:top-0 before:w-[2px] before:h-full before:block">
          <div className="ml-2 z-[1] relative">
            <FiGitCommit className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-between items-center flex-1 border-[1px] border-gray-300 bg-gray-200 rounded-lg w-full px-4 py-2">
            <div className="flex gap-6 items-center py-1 w-full">
              <div className="h-3 w-60 bg-gray-200 rounded-full dark:bg-gray-400 animate-pulse"></div>
              <div className="w-[1px] h-full bg-gray-400" />
              <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-400 w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (forksMetaData.length === 0) {
    return (
      <div className="h-full w-full px-2 flex flex-col">
        <div className="flex flex-col w-full border-gray-300 border-[1px] rounded-lg bg-white overflow-hidden">
          <div className="rounded-t-lg flex justify-between bg-gray-200 border-b-[1px] border-gray-300 items-center gap-2 py-2 px-4 h-12"></div>

          <div className="rounded-b-lg w-full bg-white text-liberty-dark-100 overflow-hidden">
            <div className="flex flex-col gap-2 h-32 w-full items-center justify-center">
              <FiGitBranch className="h-7 w-7" />
              <h1 className="text-lg font-medium">Looks like this repository hasn't been forked yet.</h1>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full px-2 py-2 flex flex-col">
      {forksMetaData.map((fork) => (
        <div className="w-full py-2 flex gap-4 relative items-center before:bg-gray-300 before:content-[''] before:absolute before:left-0 before:top-0 before:w-[2px] before:h-full before:block">
          <div className="ml-2 z-[1] relative">
            <FiGitCommit className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex justify-between flex-1 border-[1px] border-gray-300 bg-gray-200 rounded-lg w-full px-4 py-2">
            <div className="flex gap-6">
              <span
                onClick={() => handleUserClick(fork)}
                className="text-gray-900 cursor-pointer hover:underline hover:text-primary-700"
              >
                {shortenAddress(fork.owner)}
              </span>
              <div className="w-[1px] h-full bg-gray-400" />
              <span
                onClick={() => handleForkClick(fork)}
                className="text-gray-900 font-medium cursor-pointer hover:underline hover:text-primary-700"
              >
                {fork.id}/{fork.name}
              </span>
            </div>
            <div className="flex gap-6">
              <span className="text-gray-900">
                {formatDistanceToNow(new Date(fork.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
