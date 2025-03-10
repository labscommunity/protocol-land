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
import { Button } from '@/components/common/buttons'
import { trackGoogleAnalyticsPageView } from '@/helpers/google-analytics'
import { imgUrlFormatter } from '@/helpers/imgUrlFormatter'
import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
// import { fetchTokenBalance } from '@/lib/decentralize'
import { useGlobalStore } from '@/stores/globalStore'
import { Repo, RepoToken } from '@/types/repository'

import useRepository from '../hooks/useRepository'
import { useRepoHeaderStore } from '../store/repoHeader'
import ActivityGraph from './ActivityGraph'
import TokenizeModal from './decentralize-modals/Tokenize-Modal'
import TradeModal from './decentralize-modals/Trade-Modal'
import ForkModal from './ForkModal'
import RepoHeaderLoading from './RepoHeaderLoading'
import { fetchTokenDetails } from './tabs/settings-tab/components/token/fetchTokenDetails'

type Props = {
  repo: Repo | Record<PropertyKey, never>
  parentRepo: Repo | Record<PropertyKey, never> | null
  isLoading: boolean
  owner: string | null
}

export default function RepoHeader({ repo, isLoading, owner, parentRepo }: Props) {
  const [importedTokenDetails, setImportedTokenDetails] = React.useState<RepoToken | null>(null)
  const [isDecentralizationModalOpen, setIsDecentralizationModalOpen] = React.useState(false)
  const [isDecentralized, setIsDecentralized] = React.useState(false)
  const [isForkModalOpen, setIsForkModalOpen] = React.useState(false)
  const [isTradeModalOpen, setIsTradeModalOpen] = React.useState(false)
  const [showCloneDropdown, setShowCloneDropdown] = React.useState(false)
  const cloneRef = React.useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { downloadRepository } = useRepository(repo?.id, repo?.name)
  const [isRepoOwner] = useGlobalStore((state) => [state.repoCoreActions.isRepoOwner])
  const [repoHeaderState] = useRepoHeaderStore((state) => [state.repoHeaderState])

  React.useEffect(() => {
    if (repo && repo?.name) {
      trackGoogleAnalyticsPageView('pageview', location.pathname, 'Repository Page Visit', {
        repo_name: repo.name,
        repo_id: repo.id
      })
      if (repo.fork && repo.decentralized && repo.token) {
        setImportedTokenDetails(repo.token!)
      }
      fetchImportTokenDetails()
    }
  }, [repo])

  React.useEffect(() => {
    if (isLoading === true) {
      setIsDecentralized(false)
    }
  }, [isLoading])

  React.useEffect(() => {
    if (repo && repo?.decentralized === true && !isLoading) {
      setIsDecentralized(true)
    }
  }, [repo, isLoading])

  React.useEffect(() => {
    if (repo && repo?.decentralized && repo?.token?.processId) {
      fetchAndSetTokenBal()
    }
  }, [repo])

  if (isLoading) {
    return <RepoHeaderLoading />
  }

  function handleComingSoon() {
    toast.success('This feature is coming soon.')
  }

  async function fetchImportTokenDetails() {
    if (
      !repo ||
      repo.tokenType !== 'IMPORT' ||
      !repo.token ||
      !repo.token.processId ||
      repo.decentralized === false ||
      repo.fork === true
    )
      return

    const tokenDetails = await fetchTokenDetails(repo.token.processId)
    setImportedTokenDetails(tokenDetails)
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

  async function fetchAndSetTokenBal() {
    if (!repo || !repo.token || !repo.token.processId) return

    // setTokenBalLoading(true)
    // try {
    //   const bal = await fetchTokenBalance(repo.token.processId, address!)
    //   setTokenBal(bal)
    // } catch (error) {
    //   toast.error('Failed to fetch token balance.')
    // }
    // setTokenBalLoading(false)
  }

  function handleTradeClick() {
    if (!repo || !repo.token || !repo.token.processId) return

    setIsTradeModalOpen(true)
  }

  function handleUsernameClick() {
    if (!repo || !repo.owner) return

    const arweaveAddressPattern = /^[a-zA-Z0-9_-]{43}$/
    const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/

    if (arweaveAddressPattern.test(repo.owner)) {
      navigate(`/user/${repo.owner}`)
    } else if (uuidPattern.test(repo.owner)) {
      navigate(`/organization/${repo.owner}`)
    }
  }
  console.log(importedTokenDetails)
  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <div className="aspect-square h-14 w-14 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 font-bold text-2xl uppercase">{repo.name.charAt(0)}</span>
            </div>
            <div className="gap-1 flex flex-col">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <h1 className="text-xl font-bold text-gray-900">
                    <span onClick={handleUsernameClick} className="text-gray-600 underline cursor-pointer">
                      {resolveUsernameOrShorten(repo.owner, 4)}
                    </span>{' '}
                    / {repo.name}
                  </h1>
                  <SVG className="w-5 h-5 cursor-pointer" onClick={handleComingSoon} src={IconStarOutline} />
                </div>
                <span className={`border-[1px] border-primary-600 text-primary-600 rounded-full px-2 text-sm`}>
                  {repo.private ? 'Private' : 'Public'}
                </span>
                {isDecentralized && (
                  <span
                    className={`border-[1px] border-primary-600 bg-primary-600 text-white rounded-full px-2 text-sm`}
                  >
                    Tokenized
                  </span>
                )}
                {isDecentralized && repo.tokenType === 'BONDING_CURVE' && repo.token && repo.token.processId && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Button
                        className="!bg-[#26d9af] text-gray-200 !px-2 text-sm font-medium rounded-md h-full !py-[1px] justify-between gap-1"
                        variant="solid"
                        onClick={handleTradeClick}
                      >
                        <img src={imgUrlFormatter(repo.token.tokenImage)} className="w-4 h-4" />
                        Buy
                      </Button>
                      {/* {tokenBalLoading && <BeatLoader size={8} color="#56ADD9" />}
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
                      /> */}
                    </div>
                  </div>
                )}
                {isDecentralized && repo.tokenType === 'IMPORT' && importedTokenDetails && (
                  <div className="flex items-center border-[1px] border-primary-600 gap-1 font-regular bg-primary-600 text-white rounded-full h-full text-sm px-2">
                    <img src={imgUrlFormatter(importedTokenDetails.tokenImage)} className="w-4 h-4" />
                    {importedTokenDetails.tokenTicker}
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
          <div className="flex mb-4 items-center justify-end gap-4">
            {!isDecentralized && (
              <div className="flex items-center">
                <span className="mr-2 text-primary-800 font-medium">Tokenize</span>
                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer cursor-pointer"
                    checked={isDecentralized}
                    disabled={repo.decentralized === true || !isRepoOwner()}
                    onChange={() => setIsDecentralizationModalOpen(true)}
                  />
                  <div className="w-10 h-[22px] bg-gray-200 rounded-full peer peer-focus:none cursor-pointer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            )}

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

      {isDecentralizationModalOpen && (
        <TokenizeModal
          setIsTradeModalOpen={setIsTradeModalOpen}
          onClose={() => setIsDecentralizationModalOpen(false)}
          isOpen={isDecentralizationModalOpen}
        />
      )}
      {isDecentralized && isTradeModalOpen && repo.token && repo.token.processId && (
        <TradeModal onClose={() => setIsTradeModalOpen(false)} isOpen={isTradeModalOpen} />
      )}
    </div>
  )
}
