import React from 'react'
import toast from 'react-hot-toast'
import { FaRegFileZipper } from 'react-icons/fa6'
import { PiCaretDownBold } from 'react-icons/pi'
import SVG from 'react-inlinesvg'
import { useLocation, useNavigate } from 'react-router-dom'

import IconCloneOutline from '@/assets/icons/clone-outline.svg'
import IconCommitOutline from '@/assets/icons/commit-outline.svg'
import IconDriveOutline from '@/assets/icons/drive-outline.svg'
import IconForkOutline from '@/assets/icons/fork-outline.svg'
import IconStarOutline from '@/assets/icons/star-outline.svg'
import IconTagOutline from '@/assets/icons/tag-outline.svg'
import { Button } from '@/components/common/buttons'
import { trackGoogleAnalyticsPageView } from '@/helpers/google-analytics'
import { shortenAddress } from '@/helpers/shortenAddress'
import { Repo } from '@/types/repository'

import useRepository from '../hooks/useRepository'
import ActivityGraph from './ActivityGraph'
import ForkModal from './ForkModal'
import RepoHeaderLoading from './RepoHeaderLoading'

type Props = {
  repo: Repo | Record<PropertyKey, never>
  parentRepo: Repo | Record<PropertyKey, never> | null
  isLoading: boolean
  owner: string | null
}

export default function RepoHeader({ repo, isLoading, owner, parentRepo }: Props) {
  const [isForkModalOpen, setIsForkModalOpen] = React.useState(false)
  const [showCloneDropdown, setShowCloneDropdown] = React.useState(false)
  const cloneRef = React.useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { downloadRepository } = useRepository(repo?.name)

  React.useEffect(() => {
    if (repo && repo?.name) {
      trackGoogleAnalyticsPageView('pageview', location.pathname, 'Repository Page Visit', {
        repo_name: repo.name,
        repo_id: repo.id
      })
    }
  }, [repo])

  if (isLoading) {
    return <RepoHeaderLoading />
  }

  function handleComingSoon() {
    toast.success('This feature is coming soon.')
  }

  function handleCopyClone() {
    if (cloneRef.current) {
      const divContent = cloneRef.current.innerText

      navigator.clipboard
        .writeText(divContent)
        .then(() => {
          toast.success('Successfully copied to clipboard.')
        })
        .catch(() => {
          toast.error('Copy to clipboard failed.')
        })
    }
  }

  function handleClickCloneDropdown() {
    setShowCloneDropdown(!showCloneDropdown)
  }

  function handleForkButtonClick() {
    if (owner && owner === repo.owner) {
      toast.error('Cannot fork your own repo')
    } else {
      setIsForkModalOpen(true)
    }
  }

  function handleParentRepoClick() {
    if (!parentRepo) return

    navigate(`/repository/${parentRepo.id}`)
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <div className="bg-white rounded-full w-12 h-12 flex justify-center items-center border-[1px] border-gray-300">
              <h4 className="text-2xl font-bold tracking-wide text-gray-900">SK</h4>
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-gray-900">{repo.name}</h1>
                {parentRepo && (
                  <span className={`border-[1px] border-primary-600 text-primary-600 rounded-full px-2 text-sm`}>
                    Forked
                  </span>
                )}
              </div>
              <p className="text-gray-900 text-base">
                <span className="text-gray-600">Transaction ID:</span> {repo.dataTxId}
              </p>
              {parentRepo && (
                <p className="text-gray-900 text-base">
                  <span className="text-gray-600">Forked from:</span>{' '}
                  <span onClick={handleParentRepoClick} className="text-primary-600 hover:underline cursor-pointer">
                    {shortenAddress(parentRepo.id, 7)}/{parentRepo.name}
                  </span>
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 items-center text-gray-900">
            <div className="flex gap-1 items-center px-4 py-1 bg-gray-200 rounded-[4px] cursor-default">
              <SVG src={IconCommitOutline} />
              <p>100 Commit</p>
            </div>
            <div className="flex gap-1 items-center px-4 py-1 bg-gray-200 rounded-[4px] cursor-default">
              <SVG src={IconForkOutline} />
              <p>100 Branches</p>
            </div>
            <div className="flex gap-1 items-center px-4 py-1 bg-gray-200 rounded-[4px] cursor-default">
              <SVG src={IconTagOutline} />
              <p>100 Tags</p>
            </div>
            <div className="flex gap-1 items-center px-4 py-1 bg-gray-200 rounded-[4px] cursor-default">
              <SVG src={IconDriveOutline} />
              <p>1.1 MB</p>
            </div>
          </div>
          <div>
            <p className="text-gray-600">{repo.description}</p>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex mb-4 items-center justify-start gap-4">
            <Button className="rounded-[20px] flex gap-2 items-center" variant="secondary" onClick={handleComingSoon}>
              <SVG className="w-5 h-5" src={IconStarOutline} />
              <span className="text-gray-900 font-medium">10</span>
            </Button>
            <Button
              className="rounded-[20px] flex gap-2 items-center"
              variant="secondary"
              onClick={handleForkButtonClick}
            >
              <SVG src={IconForkOutline} />
              <span className="text-gray-900 font-medium">Fork</span>
            </Button>
            <div className="relative">
              <Button
                onClick={handleClickCloneDropdown}
                className="rounded-[20px] flex gap-2 items-center"
                variant="secondary"
              >
                <SVG src={IconCloneOutline} />
                <span className="text-gray-900 font-medium">Clone</span>
                <PiCaretDownBold />
              </Button>
              {showCloneDropdown && (
                <div className="px-4 py-2 z-10 divide-y divide-gray-200 divide-opacity-60 rounded-lg absolute w-96 bg-white right-0 origin-top-right border-[1px] mt-2 border-gray-300 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)]">
                  <div className="flex flex-col w-full gap-1 py-2">
                    <h3 className="font-medium text-gray-900">Clone</h3>
                    <div className="flex w-full px-2 py-1 gap-1 justify-start items-center border-[0.5px] border-gray-300 bg-gray-200 rounded-md overflow-hidden">
                      <div className="pr-2 overflow-scroll [&::-webkit-scrollbar]:hidden whitespace-nowrap">
                        <div ref={cloneRef} className="text-gray-900 w-full flex">
                          git clone proland://{repo.id} {repo.name}
                        </div>
                      </div>
                      <div onClick={handleCopyClone} className="text-gray-900 bg-gray-200 h-full px-1 cursor-pointer">
                        <SVG src={IconCloneOutline} />
                      </div>
                    </div>
                  </div>
                  <div onClick={downloadRepository} className="flex px-1 py-2 items-center gap-2 cursor-pointer">
                    <FaRegFileZipper className="w-5 h-5 text-primary-600" />
                    <span className="text-primary-600 font-medium">Download ZIP</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex relative flex-1 w-full z-999">
            <div className="h-full w-full">
              <ActivityGraph />
            </div>
          </div>
        </div>
      </div>
      <ForkModal isOpen={isForkModalOpen} setIsOpen={setIsForkModalOpen} repo={repo} />
    </div>
  )
}
