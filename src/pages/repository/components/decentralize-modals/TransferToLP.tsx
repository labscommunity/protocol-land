import { useState } from 'react'
import toast from 'react-hot-toast'
import { BsFillPatchCheckFill } from 'react-icons/bs'
import { MdError } from 'react-icons/md'

import { Button } from '@/components/common/buttons'
import { waitFor } from '@/helpers/waitFor'
import { checkLiquidityPoolReserves, createLiquidityPool } from '@/lib/bark'
import { depositToLPFromBondingCurve } from '@/lib/bonding-curve'
import { useGlobalStore } from '@/stores/globalStore'
import { CurveState } from '@/stores/repository-core/types'
import { RepoLiquidityPoolToken } from '@/types/repository'

import Loading from './Loading'

export default function TransferToLP({
  getCurveState,
  curveState
}: {
  getCurveState: () => void
  curveState: CurveState
}) {
  const [text, setText] = useState<string>('Loading...')
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'PENDING' | 'ERROR'>('IDLE')
  const [address, repo] = useGlobalStore((state) => [state.authState.address, state.repoCoreState.selectedRepo.repo])
  const [tokenizeProgress, setTokenizeProgress] = useState(0)

  async function transferToLP() {
    if (!repo) return
    console.log('transfer to lp')
    setStatus('PENDING')
    setText('Transferring to Botega...')
    setTokenizeProgress(20)
    const tokenA = repo.token!
    const tokenB = repo.bondingCurve!.reserveToken!
    try {
      const data = await createLiquidityPool({
        tokenA: tokenA as RepoLiquidityPoolToken,
        tokenB: tokenB
      })

      if (data.poolStatus === 'ERROR' && data.message) {
        setStatus('ERROR')
        toast.error(data.message)
        return
      }
      setTokenizeProgress(60)
      setText('Finalizing transfer to Botega...')
      waitFor(500)

      const depositStatus = await depositToLPFromBondingCurve(data.poolId, repo.bondingCurve!.processId!)
      if (!depositStatus.success) {
        setStatus('ERROR')
        toast.error(depositStatus.message)
        return
      }

      setTokenizeProgress(80)
      setText('Checking liquidity pool status...')

      const reserves = await checkLiquidityPoolReserves(data.poolId)

      if (!reserves) {
        setStatus('ERROR')
        toast.error('An error occurred while checking the liquidity pool status')
        return
      }
      console.log(reserves)

      const tokenAQty = parseInt(curveState.maxSupply) * 0.2
      const tokenBQty = parseInt(curveState.reserveBalance)
      let reservesHasError = false
      const expectedReserves = {
        [tokenA.processId!]: tokenAQty,
        [tokenB.processId]: tokenBQty
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
        setStatus('ERROR')
        toast.error('An error occurred while checking the liquidity pool status')
        return
      }

      setStatus('SUCCESS')
      toast.success('Liquidity pool created and liquidity transferred')

      setTimeout(() => {
        setStatus('IDLE')
      }, 2500)
      getCurveState()
    } catch (error) {
      setStatus('ERROR')
      toast.error('An error occurred while creating the liquidity pool')
    }
  }

  function handleTradeOnBotega() {
    window.open(`https://botega.arweave.dev/`, '_blank')
  }

  if (!repo) return null
  console.log(repo.owner, address)

  if (status === 'PENDING') {
    return (
      <div className="w-[30%] bg-white rounded-lg shadow-md p-4 flex flex-col justify-center h-full">
        <Loading progress={tokenizeProgress} text={text} />
      </div>
    )
  }

  if (status === 'ERROR') {
    return (
      <div className="w-[30%] bg-white items-center rounded-lg shadow-md p-4 flex flex-col gap-2 justify-center h-full">
        {/* <Loading progress={tokenizeProgress} text={text} /> */}
        <div className="flex gap-2 items-center justify-center">
          <MdError className="text-red-500 w-6 h-6" />
          <p className="text-lg font-medium text-gray-700">An error occurred</p>
        </div>
        <p className="text-sm font-medium text-gray-700 text-center">
          An error occurred while transferring liquidity to Botega. Please try again.
        </p>
        <Button
          onClick={transferToLP}
          variant="solid"
          className="w-[70%] mt-4 bg-primary-500 text-white justify-center"
        >
          Retry
        </Button>
      </div>
    )
  }

  if (status === 'SUCCESS') {
    return (
      <div className="w-[30%] bg-white items-center rounded-lg shadow-md p-4 flex flex-col gap-2 justify-center h-full">
        {/* <Loading progress={tokenizeProgress} text={text} /> */}
        <div className="flex gap-2 items-center justify-center">
          <BsFillPatchCheckFill className="text-green-500 w-6 h-6" />
          <p className="text-lg font-medium text-gray-700">Reserves transferred</p>
        </div>
        <p className="text-sm font-medium text-gray-700 text-center">
          Liquidity pool created and liquidity transferred to Botega.
        </p>
        <Button
          onClick={handleTradeOnBotega}
          variant="solid"
          className="w-[70%] mt-4 bg-primary-500 text-white justify-center"
        >
          Trade on Botega
        </Button>
      </div>
    )
  }
  return (
    <div className="w-[30%] bg-white rounded-lg shadow-md p-4 flex flex-col gap-8 justify-center h-full">
      <div className="flex gap-2 items-center justify-center">
        <BsFillPatchCheckFill className="text-green-500 w-6 h-6" />
        <p className="text-lg font-medium text-gray-700">Market Cap reached</p>
      </div>
      {repo.owner !== address && !curveState.liquidityPool && (
        <div className="flex flex-col gap-2">
          <p className="text-md text-center font-medium text-gray-700">Moving Reserves to Botega</p>
          <p className="text-sm font-medium text-gray-700 text-center">
            This project is now in the process of moving liquidity to Botega. Please check back later.
          </p>
        </div>
      )}
      {repo.owner === address && !curveState.liquidityPool && (
        <div className="flex flex-col gap-2 items-center">
          <p className="text-md text-center font-medium text-gray-700">Transfer to Botega</p>
          <p className="text-sm font-medium text-gray-700 text-center">
            Congratulations! You can now transfer liquidity to Botega.
          </p>
          <Button
            onClick={transferToLP}
            variant="solid"
            className="w-[70%] mt-4 bg-primary-500 text-white justify-center"
          >
            Transfer
          </Button>
        </div>
      )}

      {curveState.liquidityPool && (
        <div className="flex flex-col gap-2 items-center">
          <p className="text-md text-center font-medium text-gray-700">Trade on Botega</p>
          <p className="text-sm font-medium text-gray-700 text-center">Congratulations! You can now trade on Botega.</p>
          <Button
            onClick={handleTradeOnBotega}
            variant="solid"
            className="w-[70%] mt-4 bg-primary-500 text-white justify-center"
          >
            Trade on Botega
          </Button>
        </div>
      )}
    </div>
  )
}
