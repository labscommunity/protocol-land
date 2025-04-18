import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import BigNumber from 'bignumber.js'
import { Fragment, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'
import { FadeLoader } from 'react-spinners'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { waitFor } from '@/helpers/waitFor'
import {
  decentralizeRepo,
  fetchTokenBalances,
  loadImportedTokenProcess,
  loadTokenProcess,
  spawnBondingCurveProcess
} from '@/lib/decentralize'
import {
  allocateTokensByRatioWithRemainder,
  computeCirculatingSupply
} from '@/lib/import-token/computeCapTablePercentages'
import { useGlobalStore } from '@/stores/globalStore'
import { handleSaveBondingCurveId } from '@/stores/repository-core/actions'
import { BondingCurve, RepoToken } from '@/types/repository'

import { createConfetti } from '../../helpers/createConfetti'
import { ErrorMessageTypes } from './config'
import Confirm from './Confirm'
import DecentralizeError from './Error'
import Loading from './Loading'
import DecentralizeSuccess from './Success'

type TokenizeModalProps = {
  setIsTradeModalOpen: (open: boolean) => void
  onClose: () => void
  isOpen: boolean
}

type DecentralizeStatus = 'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR'

export default function TokenizeModal({ setIsTradeModalOpen, onClose, isOpen }: TokenizeModalProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [address, repo, parentRepo, setRepoDecentralized] = useGlobalStore((state) => [
    state.authState.address,
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreState.parentRepo.repo,
    state.repoCoreActions.setRepoDecentralized
  ])

  const [tokenizeProgress, setTokenizeProgress] = useState(0)
  const [tokenizeProgressText, setTokenizeProgressText] = useState('Tokenizing...')

  const [decentralizeStatus, setDecentralizeStatus] = useState<DecentralizeStatus>('IDLE')
  const [decentralizeError, setDecentralizeError] = useState<ErrorMessageTypes | null>(null)

  useEffect(() => {
    // pollLiquidityProvideMessages('QM8Tc-7yJBGyifsx-DbcDgA3_aGm-p_NOVSYfeGqLwg')
    if (repo && repo.tokenType === 'BONDING_CURVE') {
      const validToken = isTokenSettingsValid()
      const validBondingCurve = isBondingCurveSettingsValid()

      if (!validToken || !validBondingCurve) {
        setDecentralizeError('error-no-token')
      }

      setIsLoading(false)
    }

    if (repo && repo.tokenType === 'IMPORT' && repo.decentralized === false && repo.fork === false) {
      handleImportTokenization()
      setIsLoading(false)
    }
    if (repo && repo.tokenType === 'IMPORT' && repo.decentralized === false && repo.fork === true) {
      const validToken = isTokenSettingsValid()
      
      if (!validToken) {
        setDecentralizeError('error-no-token')
        setIsLoading(false)
        return
      }
      handleForkedImportTokenization()
      setIsLoading(false)
    }
  }, [repo])

  function closeModal() {
    onClose()
  }

  async function handleImportTokenization() {
    if (!repo || repo.decentralized === true) return

    try {
      setDecentralizeStatus('PENDING')
      setTokenizeProgress(30)
      setTokenizeProgressText('Importing token...')
      await decentralizeRepo(repo.id)
      await waitFor(1000)
      createConfetti()
      setTimeout(() => {
        setDecentralizeStatus('SUCCESS')
        setRepoDecentralized()
      }, 2000)
      setTokenizeProgress(100)
      setTokenizeProgressText('Tokenization complete!')
    } catch (error) {
      setDecentralizeStatus('ERROR')
      setDecentralizeError('error-generic')
    }
  }

  async function handleForkedImportTokenization() {
    if (!repo || repo.decentralized === true || repo.fork === false || !parentRepo) return
    if (!repo.token) return
    const percentage = repo.token.allocationForParentTokenHolders

    if (!percentage) return
    try {
      const maxSupplyScaled = BigNumber(repo.token.totalSupply)
        .multipliedBy(10 ** +repo.token.denomination)
        .toFixed()
      const allocationAmountForParentTokenHolders = BigNumber(maxSupplyScaled)
        .multipliedBy(percentage)
        .dividedBy(100)
        .toFixed()
      const remainingAmount = BigNumber(maxSupplyScaled).minus(allocationAmountForParentTokenHolders).toFixed()

      setDecentralizeStatus('PENDING')
      setTokenizeProgress(15)

      setTokenizeProgressText('Creating snapshot of parent token holders...')

      const balances = await fetchTokenBalances(parentRepo.token!.processId!)
      const { percentages } = computeCirculatingSupply(balances)

      setTokenizeProgress(40)

      setTokenizeProgressText('Creating project token...')

      const allocatedTokens = allocateTokensByRatioWithRemainder(percentages, allocationAmountForParentTokenHolders)
      allocatedTokens[address!] = remainingAmount

      await loadImportedTokenProcess(repo.token!, allocatedTokens)
      await waitFor(500)
      setTokenizeProgress(80)
      setTokenizeProgressText('Tokenizing repository...')
      await decentralizeRepo(repo.id)
      await waitFor(1000)
      createConfetti()
      setTimeout(() => {
        setDecentralizeStatus('SUCCESS')
        setRepoDecentralized()
      }, 2000)
      setTokenizeProgress(100)
      setTokenizeProgressText('Tokenization complete!')
    } catch (error) {
      toast.error('Failed to tokenize repository.')
      setDecentralizeStatus('ERROR')
      setDecentralizeError('error-generic')
    }

    //tokenize
  }

  function isTokenSettingsValid() {
    if (!repo) return false

    if (!repo.token) {
      return false
    }

    const requiredFields = ['tokenName', 'tokenTicker', 'denomination', 'totalSupply', 'tokenImage', 'processId']
    for (const field of requiredFields) {
      const typedField = field as keyof RepoToken
      if (!repo.token[typedField]) {
        return false
      }
    }

    return true
  }

  function isBondingCurveSettingsValid() {
    if (!repo) return false

    if (!repo.bondingCurve) {
      return false
    }

    const requiredFields = ['curveType', 'stepCount', 'initialPrice', 'finalPrice', 'lpAllocation', 'reserveToken']
    for (const field of requiredFields) {
      const typedField = field as keyof BondingCurve
      if (!repo.bondingCurve[typedField]) {
        return false
      }
    }

    return true
  }

  async function handleRepoDecentralize() {
    if (!repo) return

    if (repo.decentralized && repo.decentralized === true) {
      toast.error('Repository is already decentralized.')
      return
    }

    setDecentralizeStatus('PENDING')
    setTokenizeProgress(10)
    setTokenizeProgressText('Validating token settings...')
    try {
      if (!isTokenSettingsValid()) {
        setDecentralizeError('error-no-token')
        setDecentralizeStatus('ERROR')

        return
      }
      setTokenizeProgressText('Validating bonding curve settings...')
      if (!isBondingCurveSettingsValid()) {
        setDecentralizeError('error-no-bonding-curve')
        setDecentralizeStatus('ERROR')

        return
      }

      setTokenizeProgress(20)
      setTokenizeProgressText('Creating bonding curve...')

      const bondingCurvePid = await spawnBondingCurveProcess(repo.token!, repo.bondingCurve!, address!)
      if (!bondingCurvePid) {
        setDecentralizeError('error-generic')
        setDecentralizeStatus('ERROR')
        return
      }

      await handleSaveBondingCurveId(repo.id, bondingCurvePid)

      await waitFor(500)
      setTokenizeProgress(50)

      setTokenizeProgressText('Creating project token...')
      await loadTokenProcess(repo.token!, bondingCurvePid, repo.bondingCurve!.lpAllocation) //loading bonding curve id too
      await waitFor(1000)
      setTokenizeProgress(80)
      setTokenizeProgressText('Tokenizing repository...')
      await decentralizeRepo(repo.id)
      await waitFor(4000)
      createConfetti()
      setTimeout(() => {
        setDecentralizeStatus('SUCCESS')
        setRepoDecentralized()
      }, 2000)
      setTokenizeProgress(100)
      setTokenizeProgressText('Tokenization complete!')
    } catch (error) {
      toast.error('Failed to tokenize repository.')
      setDecentralizeStatus('ERROR')
      setDecentralizeError('error-generic')
    }
  }

  async function handleErrorActions(type: ErrorMessageTypes) {
    if (!repo) return

    if (type === 'error-no-token') {
      setDecentralizeStatus('IDLE')
      setDecentralizeError(null)
      navigate(`/repository/${repo.id}/settings/token`)
      closeModal()
    }

    let retryFunction = handleRepoDecentralize

    if (repo.tokenType === 'IMPORT' && repo.fork === true) {
      retryFunction = handleForkedImportTokenization
    }
    if (repo.tokenType === 'IMPORT' && repo.fork === false) {
      retryFunction = handleImportTokenization
    }

    if (type === 'error-generic') {
      setDecentralizeStatus('IDLE')
      setDecentralizeError(null)
      await retryFunction()
    }

    if (type === 'error-no-bonding-curve' && repo.bondingCurve) {
      setDecentralizeStatus('IDLE')
      setDecentralizeError(null)
    }
  }

  if (!repo) return null

  if (isLoading)
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {}}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-[368px] transform rounded-2xl bg-gray-50 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="w-full flex justify-between align-middle">
                    <DialogTitle as="h3" className="text-xl font-medium text-gray-900">
                      Repository Tokenization
                    </DialogTitle>
                    <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
                  </div>
                  <div className="mt-6 items-center justify-center flex flex-col gap-4 h-[400px] w-full">
                    <FadeLoader />
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => {}}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-[368px] transform rounded-2xl bg-gray-50 p-6 text-left align-middle shadow-xl transition-all">
                <div className="w-full flex justify-between align-middle">
                  <DialogTitle as="h3" className="text-xl font-medium text-gray-900">
                    Repository Tokenization
                  </DialogTitle>
                  <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
                </div>
                {!decentralizeError && decentralizeStatus === 'PENDING' && (
                  <Loading text={tokenizeProgressText} progress={tokenizeProgress} />
                )}

                {decentralizeError && (
                  <DecentralizeError
                    errorType={decentralizeError}
                    onActionClick={() => handleErrorActions(decentralizeError)}
                  />
                )}

                {decentralizeStatus === 'SUCCESS' && (
                  <DecentralizeSuccess
                    tokenType={repo.tokenType!}
                    onClose={closeModal}
                    onAction={() => {
                      setIsTradeModalOpen(true)
                    }}
                    token={repo.token!}
                  />
                )}
                {!decentralizeError && decentralizeStatus === 'IDLE' && (
                  <Confirm
                    bondingCurve={repo.bondingCurve!}
                    onAction={handleRepoDecentralize}
                    onClose={closeModal}
                    token={repo.token!}
                  />
                )}
                {/* {decentralizeStatus === 'LIQUIDITY_POOL' && repo?.liquidityPool && (
                  <TokenizedLiquidityPool
                    onAction={handleLiquidityPool}
                    onClose={closeModal}
                    liquidityPool={repo.liquidityPool}
                  />
                )} */}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
