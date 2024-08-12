import BigNumber from 'bignumber.js'
import React from 'react'
import toast from 'react-hot-toast'
import { FaRegFileZipper } from 'react-icons/fa6'
import { PiCaretDownBold } from 'react-icons/pi'
import { RiRefreshFill } from 'react-icons/ri'
import SVG from 'react-inlinesvg'
import { useLocation, useNavigate } from 'react-router-dom'
import { BeatLoader } from 'react-spinners'

import IconCloneOutline from '@/assets/icons/clone-outline.svg'
import IconCommitOutline from '@/assets/icons/commit-outline.svg'
import IconDriveOutline from '@/assets/icons/drive-outline.svg'
import IconForkOutline from '@/assets/icons/fork-outline.svg'
import IconStarOutline from '@/assets/icons/star-outline.svg'
import { Button } from '@/components/common/buttons'
import { trackGoogleAnalyticsPageView } from '@/helpers/google-analytics'
import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { createRepoToken, decentralizeRepo, fetchTokenBalance } from '@/lib/decentralize'
import { useGlobalStore } from '@/stores/globalStore'
import { Repo, RepoToken } from '@/types/repository'

import { createConfetti } from '../helpers/createConfetti'
import useRepository from '../hooks/useRepository'
import { useRepoHeaderStore } from '../store/repoHeader'
import ActivityGraph from './ActivityGraph'
import { ErrorMessageTypes } from './decentralize-modals/config'
import DecentralizeError from './decentralize-modals/Decentralize-Error'
import DecentralizeSuccess from './decentralize-modals/Decentralize-Success'
import ForkModal from './ForkModal'
import RepoHeaderLoading from './RepoHeaderLoading'

type Props = {
  repo: Repo | Record<PropertyKey, never>
  parentRepo: Repo | Record<PropertyKey, never> | null
  isLoading: boolean
  owner: string | null
}

export default function RepoHeader({ repo, isLoading, owner, parentRepo }: Props) {
  const [tokenBalLoading, setTokenBalLoading] = React.useState(false)
  const [tokenBal, setTokenBal] = React.useState<string>('0')
  const [decentralizeError, setDecentralizeError] = React.useState<ErrorMessageTypes | null>(null)
  const [isDecentralized, setIsDecentralized] = React.useState(repo?.decentralized || false)
  const [decentralizeStatus, setDecentralizeStatus] = React.useState<ApiStatus>('IDLE')
  const [isForkModalOpen, setIsForkModalOpen] = React.useState(false)
  const [showCloneDropdown, setShowCloneDropdown] = React.useState(false)
  const cloneRef = React.useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { downloadRepository } = useRepository(repo?.id, repo?.name)
  const [setRepoDecentralized] = useGlobalStore((state) => [state.repoCoreActions.setRepoDecentralized])
  const [repoHeaderState] = useRepoHeaderStore((state) => [state.repoHeaderState])

  React.useEffect(() => {
    if (repo && repo?.name) {
      trackGoogleAnalyticsPageView('pageview', location.pathname, 'Repository Page Visit', {
        repo_name: repo.name,
        repo_id: repo.id
      })
    }
  }, [repo])

  React.useEffect(() => {
    if (repo && repo?.decentralized === true && !isLoading) {
      setIsDecentralized(true)
    }
  }, [repo, isLoading])

  React.useEffect(() => {
    if (repo && repo?.token?.processId) {
      fetchAndSetTokenBal()
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
      toast.error('Cannot fork your own repo.')
    } else if (repo.private) {
      toast.error('Cannot fork private repo.')
    } else {
      setIsForkModalOpen(true)
    }
  }

  function handleParentRepoClick() {
    if (!parentRepo) return

    navigate(`/repository/${parentRepo.id}`)
  }

  async function handleRepoDecentralize(evt: React.ChangeEvent<HTMLInputElement>) {
    if (!repo) return

    if (repo.decentralized && repo.decentralized === true) {
      toast.error('Repository is already decentralized.')
      return
    }

    setDecentralizeStatus('PENDING')
    try {
      if (!isTokenSettingsValid()) {
        setDecentralizeError('error-no-token')
        setDecentralizeStatus('ERROR')

        return
      }
      const tokenId = await createRepoToken(repo.token!)
      if (!tokenId) {
        throw new Error('Failed to create token')
      }

      await decentralizeRepo(repo.id, tokenId)
      createConfetti()
      setIsDecentralized(evt.target.checked)
      setDecentralizeStatus('SUCCESS')
      setRepoDecentralized()
    } catch (error) {
      toast.error('Failed to decentralize repository.')
      setDecentralizeStatus('ERROR')
      setDecentralizeError('error-generic')
    }
  }

  async function fetchAndSetTokenBal() {
    if (!repo || !repo.token || !repo.token.processId) return

    setTokenBalLoading(true)
    try {
      const bal = await fetchTokenBalance(repo.token.processId)
      setTokenBal(bal)
    } catch (error) {
      toast.error('Failed to fetch token balance.')
    }
    setTokenBalLoading(false)
  }

  function handleTokenSettingsRedirect() {
    if (!repo) return

    navigate(`/repository/${repo.id}/settings/token`)
    setDecentralizeError(null)
  }

  function isTokenSettingsValid() {
    if (!repo) return false

    if (!repo.token) {
      return false
    }

    const requiredFields = ['tokenName', 'tokenTicker', 'denomination', 'totalSupply', 'tokenImage', 'allocations']
    for (const field of requiredFields) {
      const typedField = field as keyof RepoToken
      if (typedField === 'allocations' && repo.token[typedField].length === 0) {
        return false
      }
      if (!repo.token[typedField]) {
        return false
      }
    }

    return true
  }

  function handleTokenBalClick() {
    if (!repo || !repo.token || !repo.token.processId) return

    window.open(`https://www.ao.link/#/token/${repo.token.processId}`, '_blank')
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <div className="bg-white rounded-full w-12 h-12 flex justify-center items-center border-[1px] border-gray-300">
              <h4 className="text-2xl font-bold tracking-wide text-gray-900">SK</h4>
            </div>
            <div className="gap-1 flex flex-col">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <h1 className="text-xl font-bold text-gray-900">{repo.name}</h1>
                  <SVG className="w-5 h-5 cursor-pointer" onClick={handleComingSoon} src={IconStarOutline} />
                </div>
                <span className={`border-[1px] border-primary-600 text-primary-600 rounded-full px-2 text-sm`}>
                  {repo.private ? 'Private' : 'Public'}
                </span>
                {isDecentralized && (
                  <span
                    className={`border-[1px] border-primary-600 bg-primary-600 text-white rounded-full px-2 text-sm`}
                  >
                    Decentralized
                  </span>
                )}
                {repo.token && repo.token.processId && (
                  <div className="flex items-center gap-2">
                    <img src={repo.token.tokenImage} className="w-6 h-6" />
                    <div className="flex items-center gap-1">
                      {tokenBalLoading && <BeatLoader size={8} color="#56ADD9" />}
                      {!tokenBalLoading && (
                        <span
                          onClick={handleTokenBalClick}
                          className="text-primary-800 cursor-pointer text-sm font-bold flex gap-2 items-center underline"
                        >
                          {BigNumber(tokenBal)
                            .dividedBy(BigNumber(10 ** +repo.token.denomination))
                            .toString()}{' '}
                          {repo.token.tokenTicker}
                        </span>
                      )}
                      <RiRefreshFill
                        onClick={fetchAndSetTokenBal}
                        className="w-5 h-5 cursor-pointer text-primary-600"
                      />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-gray-900 text-base">
                <span className="text-gray-600">Transaction ID:</span> {repo.dataTxId}
              </p>
              {parentRepo && (
                <p className="text-gray-900 text-base">
                  <span className="text-gray-600">Forked from:</span>{' '}
                  <span onClick={handleParentRepoClick} className="text-primary-600 hover:underline cursor-pointer">
                    {resolveUsernameOrShorten(parentRepo.id, 7)}/{parentRepo.name}
                  </span>
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 items-center text-gray-900">
            <div className="flex gap-1 items-center px-4 py-1 bg-gray-200 rounded-[4px] cursor-default">
              <SVG src={IconCommitOutline} />
              <p>
                {repoHeaderState.commits} {repoHeaderState.commits === 1 ? 'Commit' : 'Commits'}
              </p>
            </div>
            <div className="flex gap-1 items-center px-4 py-1 bg-gray-200 rounded-[4px] cursor-default">
              <SVG src={IconForkOutline} />
              <p>
                {repoHeaderState.branches} {repoHeaderState.branches === 1 ? 'Branch' : 'Branches'}
              </p>
            </div>
            <div className="flex gap-1 items-center px-4 py-1 bg-gray-200 rounded-[4px] cursor-default">
              <SVG src={IconDriveOutline} />
              <p>{repoHeaderState.repoSize}</p>
            </div>
            <div className="flex gap-1 items-center px-4 py-1 bg-gray-200 rounded-[4px] cursor-default">
              <SVG src={IconStarOutline} />
              <p>0</p>
            </div>
          </div>
          <div>
            <p className="text-gray-600">{repo.description}</p>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex mb-4 items-center justify-start gap-4">
            <div className="flex items-center">
              <span className="mr-2 text-primary-800 font-medium">Decentralize</span>
              {decentralizeStatus === 'PENDING' && <BeatLoader size={8} color="#56ADD9" />}
              {decentralizeStatus !== 'PENDING' && (
                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer cursor-pointer"
                    checked={isDecentralized}
                    disabled={repo.decentralized === true}
                    onChange={handleRepoDecentralize}
                  />
                  <div className="w-10 h-[22px] bg-gray-200 rounded-full peer peer-focus:none cursor-pointer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              )}
            </div>
            {/* <Button className="rounded-[20px] flex gap-2 items-center" variant="secondary" onClick={handleComingSoon}>
              <SVG className="w-5 h-5" src={IconStarOutline} />
              <span className="text-gray-900 font-medium">0</span>
            </Button> */}
            <Button
              className="rounded-[20px] flex px-0 items-center"
              variant="secondary"
              onClick={handleForkButtonClick}
            >
              <div className="flex items-center gap-2 px-4">
                <SVG src={IconForkOutline} />
                <span className="text-gray-900 font-medium">Fork</span>
              </div>
              <span className="text-gray-900 font-medium border-l-[1px] border-gray-300 px-4">
                {Object.keys(repo.forks).length}
              </span>
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
                    <div className="flex w-full px-2 py-1 gap-1 justify-between items-center border-[0.5px] border-gray-300 bg-gray-200 rounded-md overflow-hidden">
                      <div className="pr-2 overflow-scroll [&::-webkit-scrollbar]:hidden whitespace-nowrap">
                        <div ref={cloneRef} className="text-gray-900 w-full flex">
                          {/* {repoOwner?.username
                            ? `git clone proland://${repoOwner.username}/${repo.name}`
                            : `git clone proland://${repo.id} ${repo.name}`} */}
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

      {decentralizeStatus === 'SUCCESS' && repo.token && (
        <DecentralizeSuccess
          onClose={() => setDecentralizeStatus('IDLE')}
          isOpen={decentralizeStatus === 'SUCCESS'}
          token={repo.token}
        />
      )}

      {decentralizeError && (
        <DecentralizeError
          isOpen={decentralizeError !== null}
          onClose={() => setDecentralizeError(null)}
          errorType={decentralizeError}
          onActionClick={
            decentralizeError === 'error-generic'
              ? (handleRepoDecentralize as () => Promise<void>)
              : (handleTokenSettingsRedirect as () => void)
          }
        />
      )}
    </div>
  )
}
