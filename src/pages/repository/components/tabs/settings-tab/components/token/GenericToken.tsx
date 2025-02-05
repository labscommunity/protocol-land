import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'
import { RepoToken } from '@/types/repository'

import DraggablePieChart from './DraggablePieChart'
import { fetchTokenDetails } from './fetchTokenDetails'
import ForkedGenericTokenForm from './ForkedGenericTokenForm'

export default function GenericToken() {
  const [tokenProcessId, setTokenProcessId] = useState<string>('')
  const [tokenDetails, setTokenDetails] = useState<RepoToken | null>(null)
  const [tokenPRocessIdError, setTokenPRocessIdError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTokenDetails, setIsLoadingTokenDetails] = useState(false)

  const [selectedRepo, parentRepo, saveImportedTokenId] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo,
    state.repoCoreState.parentRepo,
    state.repoCoreActions.saveImportedTokenId
  ])

  useEffect(() => {
    validateAndLoadTokenDetails(tokenProcessId)
  }, [tokenProcessId])

  useEffect(() => {
    if (selectedRepo?.repo?.token?.processId && selectedRepo?.repo?.tokenType === 'IMPORT') {
      setTokenProcessId(selectedRepo.repo.token.processId)
    }
  }, [selectedRepo])

  async function validateAndLoadTokenDetails(pid: string) {
    setTokenPRocessIdError(null)
    if (!pid || isDecentralized) return

    // Validate process ID format
    if (!/^[a-zA-Z0-9_-]{43}$/.test(pid)) {
      setTokenPRocessIdError('Invalid process ID format')
      return
    }
    setIsLoadingTokenDetails(true)
    const tokenDetails = await fetchTokenDetails(pid)
    setTokenDetails(tokenDetails)
    setIsLoadingTokenDetails(false)
  }

  const handleSaveImportedTokenId = async () => {
    if (!tokenProcessId) return
    setIsLoading(true)
    await saveImportedTokenId(tokenProcessId)
    setIsLoading(false)
  }

  const handleOpenProcessInAoTools = (pid: string) => {
    if (!pid) return
    window.open(`https://ao.link/#entity/${pid}`, '_blank')
  }

  const isDecentralized = selectedRepo?.repo?.decentralized === true
  const isForked = selectedRepo?.repo?.fork === true

  if (isDecentralized && !isForked) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-medium text-gray-900">Imported Token</h1>
          <div className="text-sm text-primary-600 bg-gray-200 rounded-lg px-4 py-2 w-fit">
            <div
              onClick={() => handleOpenProcessInAoTools(selectedRepo?.repo?.token?.processId || '')}
              className="flex items-center gap-1 underline cursor-pointer"
            >
              {selectedRepo?.repo?.token?.processId}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isDecentralized && isForked) {
    const allocationForParentTokenHolders = +(selectedRepo?.repo?.token?.allocationForParentTokenHolders || '0')
    const ownerAllocation = 100 - allocationForParentTokenHolders
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-gray-200 p-4 rounded-lg">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <img src={selectedRepo?.repo?.token?.tokenImage} alt="Token" className="w-8 h-8 rounded-full" />
                <div>
                  <p className="font-medium text-gray-900">{selectedRepo?.repo?.token?.tokenName}</p>
                  <p className="text-sm text-gray-600">{selectedRepo?.repo?.token?.tokenTicker}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex gap-4">
                  <span className="text-gray-600">Total Supply:</span>
                  <span className="text-gray-900 font-medium">{selectedRepo?.repo?.token?.totalSupply}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600">Denomination:</span>
                  <span className="text-gray-900 font-medium">{selectedRepo?.repo?.token?.denomination}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600">Parent Token Allocation:</span>
                  <span className="text-gray-900 font-medium">
                    {selectedRepo?.repo?.token?.allocationForParentTokenHolders}%
                  </span>
                </div>
              </div>

              <div className="text-sm text-primary-600 bg-gray-200 rounded-lg flex flex-col gap-1">
                <div>
                  <label htmlFor="process-id" className="text-gray-600 font-medium">
                    Token Process ID
                  </label>
                  <div
                    onClick={() => handleOpenProcessInAoTools(selectedRepo?.repo?.token?.processId || '')}
                    className="flex items-center gap-1 underline cursor-pointer"
                  >
                    {selectedRepo?.repo?.token?.processId}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <label htmlFor="process-id" className="text-gray-600 font-medium">
                    Parent Token Process ID
                  </label>
                  <div
                    onClick={() => handleOpenProcessInAoTools(parentRepo?.repo?.token?.processId || '')}
                    className="flex items-center gap-1 underline cursor-pointer"
                  >
                    {parentRepo?.repo?.token?.processId}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="pr-12">
              <DraggablePieChart
                parentTokenHoldersAllocation={allocationForParentTokenHolders}
                meAllocation={ownerAllocation}
                onParentTokenHoldersAllocationChange={() => {}}
              />
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#0088FE' }}></div>
                  <span className="text-sm text-gray-600">
                    Parent Token Holders ({allocationForParentTokenHolders}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#56ADD9' }}></div>
                  <span className="text-sm text-gray-600">You ({100 - +allocationForParentTokenHolders}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isDecentralized && !isForked) {
    return (
      <div className="flex flex-col gap-4">
        <div className="w-full">
          <label htmlFor="token-name" className="block mb-1 text-sm font-medium text-gray-600">
            Import from Token Process ID
          </label>
          <div className="flex items-center gap-2">
            <input
              disabled={isDecentralized}
              type="text"
              id="token-process-id"
              placeholder="Enter Token Process ID"
              className={
                'bg-white border-[1px] text-gray-900 border-gray-300 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] w-1/2 px-3 py-[10px] outline-none'
              }
              value={tokenProcessId}
              onChange={(e) => setTokenProcessId(e.target.value)}
            />
            {isLoadingTokenDetails && <BeatLoader color="#77c6ed" size={6} />}
            {!isLoadingTokenDetails && tokenDetails && (
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          {tokenPRocessIdError && <p className="text-red-500 text-sm italic mt-2">{tokenPRocessIdError}</p>}
        </div>
        <Button
          disabled={!tokenProcessId || isLoading || isLoadingTokenDetails}
          isLoading={isLoading}
          onClick={handleSaveImportedTokenId}
          variant="primary-solid"
          className="w-fit h-10"
        >
          Save Changes
        </Button>
      </div>
    )
  }

  if (!isDecentralized && isForked) {
    return <ForkedGenericTokenForm />
  }
}
