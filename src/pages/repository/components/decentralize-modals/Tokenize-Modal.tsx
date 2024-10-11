import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'
import { FadeLoader } from 'react-spinners'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { waitFor } from '@/helpers/waitFor'
import { checkLiquidityPoolReserves, createLiquidityPool, depositToLiquidityPool } from '@/lib/bark'
import { decentralizeRepo, loadTokenProcess, pollLiquidityProvideMessages } from '@/lib/decentralize'
import { useGlobalStore } from '@/stores/globalStore'
import { RepoToken } from '@/types/repository'

import { createConfetti } from '../../helpers/createConfetti'
import { CreateLiquidityPoolProps, ErrorMessageTypes } from './config'
import Confirm from './Confirm'
import DecentralizeError from './Error'
import LiquidityPoolSuccess from './LiquidityPoolSuccess'
import Loading from './Loading'
import DecentralizeSuccess from './Success'
import TokenizedLiquidityPool from './Tokenized-LiquidityPool'

type TokenizeModalProps = {
  onClose: () => void
  isOpen: boolean
}

type DecentralizeStatus =
  | 'IDLE'
  | 'PENDING'
  | 'SUCCESS'
  | 'LIQUIDITY_POOL'
  | 'ERROR'
  | 'LIQUIDITY_POOL_SUCCESS'
  | 'LIQUIDITY_POOL_PENDING'

export default function TokenizeModal({ onClose, isOpen }: TokenizeModalProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [repo, setRepoDecentralized, saveLiquidityPoolId] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repo,
    state.repoCoreActions.setRepoDecentralized,
    state.repoCoreActions.saveLiquidityPoolId
  ])
  const [liquidityPoolId, setLiquidityPoolId] = useState<string | null>(null)
  const [liquidityPoolPayload, setLiquidityPoolPayload] = useState<CreateLiquidityPoolProps | null>(null)
  const [tokenizeProgress, setTokenizeProgress] = useState(0)
  const [liquidityPoolProgress, setLiquidityPoolProgress] = useState(0)
  const [tokenizeProgressText, setTokenizeProgressText] = useState('Tokenizing...')
  const [liquidityPoolProgressText, setLiquidityPoolProgressText] = useState('Creating Liquidity Pool...')

  const [decentralizeStatus, setDecentralizeStatus] = useState<DecentralizeStatus>('IDLE')
  const [decentralizeError, setDecentralizeError] = useState<ErrorMessageTypes | null>(null)

  useEffect(() => {
    // pollLiquidityProvideMessages('QM8Tc-7yJBGyifsx-DbcDgA3_aGm-p_NOVSYfeGqLwg')
    if (repo) {
      const valid = isTokenSettingsValid()

      if (!valid) {
        setDecentralizeError('error-no-token')
      }

      setIsLoading(false)
    }
  }, [repo])

  function closeModal() {
    onClose()
  }

  function isTokenSettingsValid() {
    if (!repo) return false

    if (!repo.token) {
      return false
    }

    const requiredFields = [
      'tokenName',
      'tokenTicker',
      'denomination',
      'totalSupply',
      'tokenImage',
      'allocations',
      'processId'
    ]
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

  async function handleRepoDecentralize() {
    if (!repo) return

    if (repo.decentralized && repo.decentralized === true) {
      toast.error('Repository is already decentralized.')
      return
    }

    setDecentralizeStatus('PENDING')
    setTokenizeProgress(20)
    setTokenizeProgressText('Validating token settings...')
    try {
      if (!isTokenSettingsValid()) {
        setDecentralizeError('error-no-token')
        setDecentralizeStatus('ERROR')

        return
      }
      await waitFor(2000)
      setTokenizeProgress(40)
      setTokenizeProgressText('Creating project token...')
      await loadTokenProcess(repo.token!, repo.token!.processId!)
      await waitFor(4000)
      setTokenizeProgress(80)
      setTokenizeProgressText('Tokenizing project...')
      await decentralizeRepo(repo.id)
      await waitFor(6000)
      createConfetti()
      setTimeout(() => {
        setDecentralizeStatus('SUCCESS')
        setRepoDecentralized()
      }, 2000)
      setTokenizeProgress(100)
      setTokenizeProgressText('Tokenization complete!')
    } catch (error) {
      toast.error('Failed to decentralize repository.')
      setDecentralizeStatus('ERROR')
      setDecentralizeError('error-generic')
    }
  }
  async function handleLiquidityPool(payload: CreateLiquidityPoolProps) {
    if (!repo) return
    setLiquidityPoolPayload(payload)
    setDecentralizeStatus('LIQUIDITY_POOL_PENDING')
    try {
      //check before creating pool
      setLiquidityPoolProgress(30)
      setLiquidityPoolProgressText('Creating liquidity pool...')
      const data = await createLiquidityPool(payload)

      if (data.poolStatus === 'ERROR' && data.message) {
        setDecentralizeError('error-liquidity-pool')
        setDecentralizeStatus('ERROR')

        toast.error(data.message)
        return
      }

      setLiquidityPoolProgress(50)
      setLiquidityPoolProgressText('Depositing token A...')
      await depositToLiquidityPool(data.poolId, payload.tokenA, payload.amountA)
      await waitFor(1000)
      setLiquidityPoolProgress(70)
      setLiquidityPoolProgressText('Depositing token B...')
      const depositMsgIdB = await depositToLiquidityPool(data.poolId, payload.tokenB, payload.amountB)

      const statusB = await pollLiquidityProvideMessages(depositMsgIdB)

      if (statusB.status === 'ERROR') {
        setDecentralizeError('error-liquidity-pool')
        setDecentralizeStatus('ERROR')

        toast.error(statusB.message)
        return
      }

      setLiquidityPoolProgress(90)
      setLiquidityPoolProgressText('Checking liquidity pool reserves...')
      const reserves = await checkLiquidityPoolReserves(data.poolId)

      if (!reserves) {
        setDecentralizeError('error-liquidity-pool')
        setDecentralizeStatus('ERROR')
        toast.error('Failed to check liquidity pool reserves.')
        return
      }

      let reservesHasError = false
      const expectedReserves = {
        [payload.tokenA.processId]: +payload.amountA * 10 ** +payload.tokenA.denomination,
        [payload.tokenB.processId]: +payload.amountB * 10 ** +payload.tokenB.denomination
      }

      if (Object.keys(reserves).length !== 2) {
        reservesHasError = true
      } else {
        for (const [processId, expectedAmount] of Object.entries(expectedReserves)) {
          if (!(processId in reserves) || +reserves[processId] !== expectedAmount) {
            reservesHasError = true
            break
          }
        }
      }

      if (reservesHasError) {
        setDecentralizeError('error-liquidity-pool')
        setDecentralizeStatus('ERROR')
        toast.error('Reserves do not match expected values.')
        return
      }

      await saveLiquidityPoolId(data.poolId)

      setLiquidityPoolProgress(100)
      setLiquidityPoolProgressText('Liquidity pool created!')

      setLiquidityPoolId(data.poolId)
      createConfetti()

      setTimeout(() => {
        setDecentralizeStatus('LIQUIDITY_POOL_SUCCESS')
      }, 2000)
    } catch (error) {
      console.log({ error })
      setDecentralizeError('error-liquidity-pool')
      setDecentralizeStatus('ERROR')

      toast.error('Failed to create liquidity pool.')
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

    if (type === 'error-generic') {
      setDecentralizeStatus('IDLE')
      setDecentralizeError(null)
      await handleRepoDecentralize()
    }

    if (type === 'error-liquidity-pool' && liquidityPoolPayload) {
      setDecentralizeStatus('LIQUIDITY_POOL')
      setDecentralizeError(null)
      await handleLiquidityPool(liquidityPoolPayload)
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
                {!decentralizeError && decentralizeStatus === 'LIQUIDITY_POOL_PENDING' && (
                  <Loading text={liquidityPoolProgressText} progress={liquidityPoolProgress} />
                )}
                {decentralizeError && (
                  <DecentralizeError
                    errorType={decentralizeError}
                    onActionClick={() => handleErrorActions(decentralizeError)}
                  />
                )}
                {decentralizeStatus === 'LIQUIDITY_POOL_SUCCESS' && (
                  <LiquidityPoolSuccess
                    poolId={liquidityPoolId || ''}
                    onClose={closeModal}
                    liquidityPoolPayload={liquidityPoolPayload}
                  />
                )}
                {decentralizeStatus === 'SUCCESS' && (
                  <DecentralizeSuccess
                    onClose={closeModal}
                    onAction={() => {
                      setDecentralizeStatus('LIQUIDITY_POOL')
                    }}
                    withLiquidityPool={!!repo?.liquidityPool}
                    token={repo.token!}
                  />
                )}
                {!decentralizeError && decentralizeStatus === 'IDLE' && (
                  <Confirm
                    onAction={handleRepoDecentralize}
                    onClose={closeModal}
                    token={repo.token!}
                    withLiquidityPool={!!repo?.liquidityPool}
                  />
                )}
                {decentralizeStatus === 'LIQUIDITY_POOL' && repo?.liquidityPool && (
                  <TokenizedLiquidityPool
                    onAction={handleLiquidityPool}
                    onClose={closeModal}
                    liquidityPool={repo.liquidityPool}
                  />
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
