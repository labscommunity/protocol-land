import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import Progress from '@ramonak/react-progress-bar'
import BigNumber from 'bignumber.js'
import clsx from 'clsx'
import { Fragment } from 'react'
import React from 'react'
import { toast } from 'react-hot-toast'
import SVG from 'react-inlinesvg'
import { BeatLoader } from 'react-spinners'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'
import { imgUrlFormatter } from '@/helpers/imgUrlFormatter'
import { shortenAddress } from '@/helpers/shortenAddress'
import { getCurrentStep, getTokenBuyPrice, getTokenNextBuyPrice, getTokenSellPrice } from '@/lib/bonding-curve'
import { buyTokens } from '@/lib/bonding-curve/buy'
import { getCurveState, getTokenCurrentSupply } from '@/lib/bonding-curve/helpers'
import { sellTokens } from '@/lib/bonding-curve/sell'
import { fetchTokenBalance, fetchTokenBalances } from '@/lib/decentralize'
import { useGlobalStore } from '@/stores/globalStore'
import { CurveState } from '@/stores/repository-core/types'
import { RepoToken } from '@/types/repository'

import { customFormatNumber } from '../../helpers/customFormatNumbers'
import MarketStats from './MarketStats'
import { TradeChart } from './TradeChart'
import TransferToLP from './TransferToLP'

type TradeModalProps = {
  onClose: () => void
  isOpen: boolean
}

interface MarketStatsProps {
  marketCap: string
  marketCapUSD: string
  volume: string
  circulatingSupply: string
  baseTokenTicker: string
}

export default function TradeModal({ onClose, isOpen }: TradeModalProps) {
  const amountRef = React.useRef<HTMLInputElement>(null)
  const [balances, setBalances] = React.useState<Record<string, string>>({})
  const [transactionPending, setTransactionPending] = React.useState<boolean>(false)
  const [curveState, setCurveState] = React.useState<CurveState>({} as CurveState)
  const [price, setPrice] = React.useState<string>('0')
  const [priceUnscaled, setPriceUnscaled] = React.useState<string>('0')
  const [currentSupply, setCurrentSupply] = React.useState<string>('0')
  const [maxSupply, setMaxSupply] = React.useState<string>('0')
  const [reserveTokenBalance, setReserveTokenBalance] = React.useState<string>('0')

  const [afterTradeSupply, setAfterTradeSupply] = React.useState<{
    rangeTo: number
    price: number
    index: number
  } | null>(null)
  const [isFetchingNextPrice, setIsFetchingNextPrice] = React.useState<boolean>(false)
  const [nextPrice, setNextPrice] = React.useState<string>('0')
  const [baseAssetPriceUSD, setBaseAssetPriceUSD] = React.useState<string>('0')
  const [priceInUSD, setPriceInUSD] = React.useState<string>('0')
  const [stats, setStats] = React.useState<MarketStatsProps>({
    marketCap: '0',
    marketCapUSD: '0',
    volume: '0',
    circulatingSupply: '0',
    baseTokenTicker: '-'
  })
  const [currentIndex, setCurrentIndex] = React.useState<number>(0)
  const [repoTokenBalance, setRepoTokenBalance] = React.useState<string>('0')
  const [amount, setAmount] = React.useState<string>('')
  const [tokenPair, setTokenPair] = React.useState<RepoToken[]>([])
  const [selectedTokenToTransact, setSelectedTokenToTransact] = React.useState<number>(0)
  const [selectedSide, setSelectedSide] = React.useState<'buy' | 'sell'>('buy')
  const [repo, address] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo, state.authState.address])
  const [progress, setProgress] = React.useState<number>(0)
  React.useEffect(() => {
    if (repo && repo.token && repo.bondingCurve && repo.bondingCurve.reserveToken) {
      setTokenPair([repo.token, repo.bondingCurve.reserveToken as RepoToken])
      setSelectedTokenToTransact(0)
      handleGetCurveState()
      handleGetTokenBalances()
      handleGetCurrentSupply()
      // handleGetTransactions()
    }
  }, [repo])

  React.useEffect(() => {
    setAmount('')
  }, [selectedSide])
  console.log(reserveTokenBalance)
  React.useEffect(() => {
    if (curveState.maxSupply) {
      const formattedMaxSupply = BigNumber(curveState.maxSupply)
        .dividedBy(BigNumber(10).pow(BigNumber(curveState.repoToken.denomination)))
        .toString()
      setMaxSupply(formattedMaxSupply)
      // setProgress((+curveState.reserveBalance / +curveState.fundingGoal) * 100)
      handleGetTokenHoldersBalances()
      fetchStats()
    }
  }, [curveState])

  React.useEffect(() => {
    if (!curveState.steps || !stats?.circulatingSupply) return

    if (!amount || amount === '0') return setAfterTradeSupply(null)
    const numericAmount = Number(selectedSide === 'buy' ? amount : `-${amount}`)
    const afterAmount = BigNumber(stats.circulatingSupply).plus(BigNumber(numericAmount))
    const formattedAfterAmount = BigNumber(afterAmount).multipliedBy(
      BigNumber(10).pow(BigNumber(curveState.repoToken.denomination))
    )
    const currentStep = curveState.steps[currentIndex + 1]
    let index = 0
    const point = curveState.steps.find((step, idx) => {
      if (formattedAfterAmount.lte(step.rangeTo)) {
        index = idx
        return true
      }
      return false
    })
    const formattedPointPrice = BigNumber(point?.price || 0).dividedBy(
      BigNumber(10).pow(BigNumber(curveState.reserveToken.denomination))
    )
    const formattedCurrentStepRange = BigNumber(currentStep.rangeTo).dividedBy(
      BigNumber(10).pow(BigNumber(curveState.repoToken.denomination))
    )

    if (formattedCurrentStepRange.eq(afterAmount) && currentStep.price === point?.price) {
      setAfterTradeSupply(null)
    } else {
      setAfterTradeSupply({ rangeTo: afterAmount.toNumber(), price: formattedPointPrice.toNumber(), index })
    }
  }, [curveState.steps, stats?.circulatingSupply, amount])

  React.useEffect(() => {
    if (!repo?.token || !curveState?.maxSupply) return
    if (+currentSupply > 0) {
      const formattedMaxSupply = BigNumber(curveState.maxSupply)
        .dividedBy(BigNumber(10).pow(BigNumber(repo.token!.denomination)))
        .toString()
      setProgress(BigNumber(+currentSupply).dividedBy(BigNumber(formattedMaxSupply)).multipliedBy(100).toNumber())
      fetchCurrentStep(curveState, currentSupply)
    }
  }, [currentSupply, curveState])

  React.useEffect(() => {
    if (BigNumber(amount).gt(0)) {
      handleGetBuyPrice()
    } else {
      setPrice('0')
    }
  }, [amount])

  React.useEffect(() => {
    if (!baseAssetPriceUSD || !+baseAssetPriceUSD || !+nextPrice) return

    // Convert nextPrice from AR to USD by multiplying AR price by USD/AR rate
    const priceInUSD = BigNumber(nextPrice)
      .multipliedBy(BigNumber(baseAssetPriceUSD))
      // .dividedBy(BigNumber(10).pow(BigNumber(repo?.token!.denomination)))
      .toString()

    setPriceInUSD(priceInUSD)
  }, [baseAssetPriceUSD, nextPrice])

  React.useEffect(() => {
    if (!curveState?.reserveToken || !+nextPrice) return
    fetchBaseAssetPriceUSD()
  }, [curveState, nextPrice])

  async function handleGetTokenBalances() {
    if (!repo || !address || !repo.bondingCurve || !repo.token) return
    const reserveTokenBalance = await fetchTokenBalance(repo.bondingCurve.reserveToken.processId!, address!)
    const repoTokenBalance = await fetchTokenBalance(repo.token.processId!, address!)
    setReserveTokenBalance((+reserveTokenBalance / 10 ** +repo.bondingCurve.reserveToken.denomination).toString())
    setRepoTokenBalance((+repoTokenBalance / 10 ** +repo.token.denomination).toString())
  }

  async function handleGetTokenHoldersBalances() {
    if (!repo || !repo.token) return
    const balances = await fetchTokenBalances(repo.token.processId!)
    if (!curveState.maxSupply) return

    // Convert raw balances to percentages of max supply
    const balancesAsPercentages = Object.entries(balances).reduce(
      (acc, [address, amount]) => {
        const percentage = ((Number(amount) / Number(curveState.maxSupply)) * 100).toFixed(2)
        acc[address] = percentage
        return acc
      },
      {} as Record<string, string>
    )
    setBalances(balancesAsPercentages)
  }

  async function handleGetCurveState() {
    if (!repo?.bondingCurve) return

    const state = await getCurveState(repo.bondingCurve.processId!)
    setCurveState(state)
  }

  async function handleGetCurrentSupply() {
    if (!repo?.token) return
    const currentSupply = await getTokenCurrentSupply(repo.token!.processId!)
    const formattedSupply = BigNumber(currentSupply)
      .dividedBy(BigNumber(10).pow(BigNumber(repo.token!.denomination)))
      .toString()
    setCurrentSupply(formattedSupply)
  }

  function handleTokenSwitch() {
    toast.success('Coming soon')
    return
    if (!repo) return
    if (selectedTokenToTransact === 0) {
      setSelectedTokenToTransact(1)
    } else {
      setSelectedTokenToTransact(0)
    }
  }

  function closeModal() {
    onClose()
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const amt = e.target.value
    if (!curveState.maxSupply) return

    if (!amt) {
      setAmount('0')
      setPrice('0')
      return
    }

    const formattedMaxSupply = BigNumber(curveState.maxSupply).dividedBy(
      BigNumber(10).pow(BigNumber(curveState.repoToken!.denomination))
    )
    const formattedAllocationForLP = BigNumber(curveState.allocationForLP).dividedBy(
      BigNumber(10).pow(BigNumber(curveState.repoToken!.denomination))
    )
    const formattedMaxSupplyMinusAllocationForLP = formattedMaxSupply.minus(formattedAllocationForLP)

    if (selectedSide === 'buy' && BigNumber(amt).gte(formattedMaxSupplyMinusAllocationForLP)) {
      setAmount(formattedMaxSupplyMinusAllocationForLP.toFixed())
      amountRef.current!.value = formattedMaxSupplyMinusAllocationForLP.toFixed()

      return
    }

    if (selectedSide === 'sell' && BigNumber(amt).gt(repoTokenBalance)) {
      setAmount(repoTokenBalance)
      amountRef.current!.value = repoTokenBalance

      return
    }

    setAmount(amt)
  }

  async function handleGetBuyPrice() {
    if (!amount || !repo?.bondingCurve || !curveState.maxSupply) return

    let tokenPrice = '0'
    const currentSupply = await getTokenCurrentSupply(repo.token!.processId!)
    if (selectedSide === 'buy') {
      // price = await calculateTokensBuyCost(
      //   repo.token!.processId!,
      //   tokensToBuy,
      //   +curveState.maxSupply,
      //   +curveState.fundingGoal
      // )

      tokenPrice = await getTokenBuyPrice(amount, currentSupply, curveState)
    }
    if (selectedSide === 'sell') {
      tokenPrice = await getTokenSellPrice(amount, currentSupply, curveState)
    }
    setPriceUnscaled(tokenPrice)
    // const priceInReserveTokens = BigNumber(price)
    //   .dividedBy(BigNumber(10).pow(BigNumber(repo.bondingCurve.reserveToken.denomination)))
    //   .toString()
    // // const formattedPrice = parseScientific(
    // //   roundToSignificantFigures(priceInReserveTokens, +repo.bondingCurve.reserveToken.denomination).toString()
    // // )

    setPrice(
      BigNumber(tokenPrice)
        .dividedBy(BigNumber(10).pow(BigNumber(repo.bondingCurve.reserveToken.denomination)))
        .toFixed() || ''
    )
  }

  async function handleSelectedSideChange(side: 'buy' | 'sell') {
    if (transactionPending) return
    setSelectedSide(side)
    setAmount('')
    amountRef.current!.value = '0'
    setPrice('0')
  }

  async function handleSideAction() {
    if (selectedSide === 'buy') {
      await handleBuy()
    }
    if (selectedSide === 'sell') {
      await handleSell()
    }

    await handleGetTokenBalances()
    await handleGetCurveState()
    // await handleGetTransactions()
  }

  async function handleBuy() {
    if (!repo || !repo.bondingCurve || !repo.bondingCurve.reserveToken) return
    if (+amount <= 0) return
    if (+price <= 0) return
    try {
      setTransactionPending(true)
      // const currentSupply = await getTokenCurrentSupply(repo.token!.processId!)
      const { success } = await buyTokens(
        repo.bondingCurve.processId!,
        repo.bondingCurve.reserveToken.processId!,
        BigNumber(amount)
          .multipliedBy(BigNumber(10).pow(BigNumber(repo.token!.denomination)))
          .toFixed(),
        priceUnscaled
      )
      if (success) {
        toast.success('Tokens bought successfully.')
        setAmount('')
        setPrice('0')
        await handleGetCurrentSupply()
        amountRef.current!.value = ''
      }

      if (!success) {
        toast.error('Error buying tokens. Try again later.')
      }
    } catch (error) {
      toast.error('Error buying tokens. Try again later.')
    } finally {
      setTransactionPending(false)
    }
  }

  async function handleSell() {
    if (!repo || !repo.bondingCurve || !repo.bondingCurve.reserveToken) return
    if (+amount <= 0) return
    if (+price <= 0) return
    try {
      setTransactionPending(true)
      const { success } = await sellTokens(
        repo.bondingCurve.processId!,
        BigNumber(amount)
          .multipliedBy(BigNumber(10).pow(BigNumber(repo.token!.denomination)))
          .toFixed()
      )
      if (success) {
        toast.success('Tokens sold successfully.')
        setAmount('')
        setPrice('0')
        await handleGetCurrentSupply()
        amountRef.current!.value = ''
      }

      if (!success) {
        toast.error('Error selling tokens. Try again later.')
      }
    } catch (error) {
      toast.error('Error selling tokens. Try again later.')
    } finally {
      setTransactionPending(false)
    }
  }

  function parseReserveBalance() {
    if (!repo?.bondingCurve?.reserveToken || !curveState.reserveBalance) return 0
    return BigNumber(curveState.reserveBalance)
      .dividedBy(BigNumber(10).pow(BigNumber(repo?.bondingCurve?.reserveToken?.denomination || 0)))
      .toString()
  }

  async function fetchCurrentStep(_curveData: CurveState, _currentSupply: string) {
    const scaledCurrentSupply = BigNumber(_currentSupply)
      .multipliedBy(BigNumber(10).pow(BigNumber(repo?.token?.denomination || 0)))
      .toFixed()

    const currentStep = await getCurrentStep(scaledCurrentSupply, _curveData.steps)
    setCurrentIndex(currentStep - 1)
  }

  async function fetchStats() {
    if (!repo?.token?.processId) return
    setIsFetchingNextPrice(true)

    const normalizedSupply = BigNumber(currentSupply).toFixed()
    const nextPrice = await getTokenNextBuyPrice(currentSupply, curveState)
    const nextPriceFormatted = BigNumber(nextPrice)
      .dividedBy(BigNumber(10).pow(BigNumber(curveState.reserveToken.denomination)))
      .toString()

    setNextPrice(nextPriceFormatted)
    setIsFetchingNextPrice(false)

    const marketCapUSD = BigNumber(nextPriceFormatted).multipliedBy(BigNumber(normalizedSupply)).toFixed()
    setStats({
      marketCap: '0',
      marketCapUSD: marketCapUSD,
      volume: '0',
      circulatingSupply: normalizedSupply,
      baseTokenTicker: repo?.bondingCurve?.reserveToken?.tokenTicker || '-'
    })
  }

  async function fetchBaseAssetPriceUSD() {
    if (!curveState?.reserveToken) return
    const token = curveState.reserveToken

    if (token.tokenTicker === 'TUSDA') {
      setBaseAssetPriceUSD('24')

      return
    }

    try {
      const response = await fetch('https://api.redstone.finance/prices?symbol=AR&provider=redstone-rapid&limit=1')
      const data = await response.json()
      setBaseAssetPriceUSD(data[0].value.toString())
    } catch (error) {
      console.error('Failed to fetch AR price:', error)
      setBaseAssetPriceUSD('0')
    }
  }

  const selectedToken = tokenPair[selectedTokenToTransact]
  if (!repo || !selectedToken) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => (transactionPending ? undefined : closeModal)}>
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
              <DialogPanel className="flex flex-col gap-6 w-full max-w-[1200px] h-[980px] transform rounded-2xl bg-gray-50 p-6 text-left align-middle shadow-xl transition-all">
                <div className="w-full flex justify-between align-middle">
                  <DialogTitle as="h3" className="text-xl font-medium text-gray-900">
                    ${repo.token?.tokenTicker} / ${repo.bondingCurve?.reserveToken?.tokenTicker}
                  </DialogTitle>

                  <SVG
                    onClick={transactionPending ? undefined : closeModal}
                    src={CloseCrossIcon}
                    className="w-6 h-6 cursor-pointer"
                  />
                </div>

                <div className="flex h-[700px] gap-8">
                  {/* TradingView Chart Section - 70% */}
                  <div className="w-[70%] bg-white rounded-lg shadow-md p-4 flex flex-col gap-8">
                    <div className="z-10 max-h-[32px] h-full absolute top-24 left-8 flex flex-col items-start justify-between px-4 py-4 gap-1">
                      {isFetchingNextPrice ? (
                        <div className="flex items-center gap-2">
                          <BeatLoader color="#56ADD9" />
                          <span className="text-base font-bold text-gray-800">
                            {repo?.bondingCurve?.reserveToken?.tokenTicker}
                          </span>
                        </div>
                      ) : (
                        <h2 className="text-2xl font-bold text-gray-800">
                          {customFormatNumber(+nextPrice, 12, 3)}{' '}
                          <span className="text-base">{repo?.bondingCurve?.reserveToken?.tokenTicker}</span>
                        </h2>
                      )}
                      <p className="text-base text-gray-700 font-bold">${customFormatNumber(+priceInUSD, 12, 3)}</p>
                    </div>
                    <TradeChart
                      afterTradeSupply={afterTradeSupply}
                      steps={curveState.steps || []}
                      currentIndex={currentIndex + 1}
                      tokenA={repo.token!}
                      tokenB={repo.bondingCurve!.reserveToken!}
                    />
                    {/* <TradeChartComponent
                      reserveBalance={parseReserveBalance().toString()}
                      repo={repo}
                      data={chartData}
                      curveState={curveState}
                      repoTokenBuyAmount={selectedSide === 'buy' ? amount : `-${amount}`}
                    /> */}
                  </div>

                  {/* Buy/Sell Widget Section - 30% */}
                  {BigNumber(currentSupply).gt(0) && BigNumber(currentSupply).eq(BigNumber(maxSupply)) ? (
                    <TransferToLP getCurveState={handleGetCurveState} curveState={curveState} />
                  ) : (
                    <div className="w-[30%] bg-white rounded-lg shadow-md p-4 flex flex-col gap-8">
                      <div className="flex flex-col gap-2">
                        <h1 className="text-base text-gray-600 font-medium">Bonding Curve Progress</h1>
                        <Progress
                          height="18px"
                          labelClassName="text-white text-sm pr-2"
                          bgColor="#56ADD9"
                          completed={Math.round(progress)}
                        />
                        <div className="flex items-center justify-between">
                          <h1 className="text-sm text-gray-600 font-medium">Reserve Balance</h1>
                          <h1 className="text-sm text-gray-600 font-medium">
                            {parseReserveBalance()} {repo?.bondingCurve?.reserveToken.tokenTicker}
                          </h1>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSelectedSideChange('buy')}
                            className="w-1/2 justify-center font-medium !py-2"
                            variant={selectedSide === 'buy' ? 'primary-solid' : 'primary-outline'}
                          >
                            Buy
                          </Button>
                          <Button
                            onClick={() => handleSelectedSideChange('sell')}
                            className={clsx('w-1/2 justify-center font-medium !py-2', {
                              'bg-red-500 hover:bg-red-500': selectedSide === 'sell'
                            })}
                            variant={selectedSide === 'sell' ? 'primary-solid' : 'primary-outline'}
                          >
                            Sell
                          </Button>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-2">
                              <label className="text-sm text-gray-600">Amount</label>
                              <div className="flex items-center">
                                <div
                                  onClick={handleTokenSwitch}
                                  className="text-xs px-2 py-1 cursor-pointer hover:bg-primary-700 rounded-sm bg-primary-600 text-white"
                                >
                                  Switch to $
                                  {selectedTokenToTransact === 0
                                    ? tokenPair[1]?.tokenTicker
                                    : tokenPair[0]?.tokenTicker}
                                </div>
                              </div>
                            </div>
                            <div className="flex w-full relative items-center pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                              <input
                                disabled={transactionPending}
                                onChange={handleAmountChange}
                                className="w-full focus:outline-none  px-3 flex-1 disabled:bg-transparent"
                                type="number"
                                ref={amountRef}
                                placeholder="0.00"
                              />
                              <div className="flex items-center gap-2">
                                {selectedToken?.tokenTicker}
                                <img
                                  className="w-6 h-6 object-cover"
                                  src={imgUrlFormatter(selectedToken?.tokenImage || '')}
                                />
                              </div>
                            </div>
                          </div>

                          {price && selectedSide === 'buy' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-sm text-gray-600">Price</label>
                              <div className="text-base flex items-center gap-1 font-medium text-gray-600">
                                {price}{' '}
                                {selectedSide === 'buy'
                                  ? repo?.bondingCurve?.reserveToken.tokenTicker
                                  : repo?.token?.tokenTicker}
                                <img
                                  className="w-6 h-6"
                                  src={imgUrlFormatter(
                                    selectedSide === 'buy'
                                      ? repo?.bondingCurve?.reserveToken?.tokenImage || ''
                                      : repo?.token?.tokenImage || ''
                                  )}
                                />
                              </div>
                            </div>
                          )}
                          {selectedSide === 'buy' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-sm text-gray-600">You will receive</label>
                              <div className="text-base flex items-center gap-1 font-medium text-gray-600">
                                {amount} {repo?.token?.tokenTicker}{' '}
                                <img className="w-6 h-6" src={imgUrlFormatter(repo?.token?.tokenImage || '')} />
                              </div>
                            </div>
                          )}
                          {/* {selectedSide === 'buy' && (
                          <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Balance</label>
                            <div className="text-base flex items-center gap-1 font-medium text-gray-600">
                              {reserveTokenBalance} {repo?.bondingCurve?.reserveToken.tokenTicker}{' '}
                              <img
                                className="w-6 h-6"
                                src={imgUrlFormatter(repo?.bondingCurve?.reserveToken.tokenImage || '')}
                              />
                            </div>
                          </div>
                        )} */}
                          {selectedSide === 'sell' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-sm text-gray-600">Balance</label>
                              <div className="text-base flex items-center gap-1 font-medium text-gray-600">
                                {repoTokenBalance} {repo?.token?.tokenTicker}{' '}
                                <img className="w-6 h-6" src={imgUrlFormatter(repo?.token?.tokenImage || '')} />
                              </div>
                            </div>
                          )}
                          {selectedSide === 'sell' && (
                            <div className="flex flex-col gap-1">
                              <label className="text-sm text-gray-600">You will receive</label>
                              <div className="text-base flex items-center gap-1 font-medium text-gray-600">
                                {price} {repo?.bondingCurve?.reserveToken.tokenTicker}
                                <img
                                  className="w-6 h-6"
                                  src={imgUrlFormatter(repo?.bondingCurve?.reserveToken.tokenImage || '')}
                                />
                              </div>
                            </div>
                          )}
                          <Button
                            isLoading={transactionPending}
                            disabled={transactionPending || !+amount || !+price}
                            onClick={handleSideAction}
                            className="w-full justify-center font-medium mt-4"
                            variant="primary-solid"
                          >
                            {selectedSide === 'buy' ? 'Buy Now' : 'Sell Now'}
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 h-full flex-1">
                        <label className="text-sm text-gray-600 font-medium">Holder distribution (%) </label>
                        <div className="w-full h-full bg-gray-100 rounded-md p-4">
                          {Object.entries(balances).map(([balAddress, percentage], index) => (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 font-medium">
                                {index + 1}. {shortenAddress(balAddress, 6)}{' '}
                                {repo.bondingCurve?.processId === balAddress ? '(Bonding Curve)' : ''}
                                {address === balAddress ? '(Creator)' : ''}
                              </span>
                              <span className="text-sm text-gray-600">{percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <MarketStats {...stats} />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
