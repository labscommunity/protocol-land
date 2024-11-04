import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import Progress from '@ramonak/react-progress-bar'
import clsx from 'clsx'
import { Fragment } from 'react'
import React from 'react'
import { toast } from 'react-hot-toast'
import SVG from 'react-inlinesvg'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'
import { imgUrlFormatter } from '@/helpers/imgUrlFormatter'
import { parseScientific } from '@/helpers/parseScientific'
import { shortenAddress } from '@/helpers/shortenAddress'
import { debounce } from '@/helpers/withDebounce'
import { getBuySellTransactionsOfCurve, getTokenBuyPrice } from '@/lib/bonding-curve'
import { buyTokens } from '@/lib/bonding-curve/buy'
import { getCurveState, getTokenCurrentSupply } from '@/lib/bonding-curve/helpers'
import { calculateTokensSellCost, sellTokens } from '@/lib/bonding-curve/sell'
import { fetchTokenBalance, fetchTokenBalances } from '@/lib/decentralize'
import { useGlobalStore } from '@/stores/globalStore'
import { CurveState } from '@/stores/repository-core/types'
import { RepoToken } from '@/types/repository'

import TradeChartComponent from './TradeChartComponent'

type TradeModalProps = {
  onClose: () => void
  isOpen: boolean
}

type ChartData = {
  time: string | number
  value: number
}

export default function TradeModal({ onClose, isOpen }: TradeModalProps) {
  const [chartData, setChartData] = React.useState<ChartData[]>([])
  const [balances, setBalances] = React.useState<Record<string, string>>({})
  const [transactionPending, setTransactionPending] = React.useState<boolean>(false)
  const [curveState, setCurveState] = React.useState<CurveState>({} as CurveState)
  const [price, setPrice] = React.useState<string>('0')
  const [priceUnscaled, setPriceUnscaled] = React.useState<string>('0')
  const [reserveTokenBalance, setReserveTokenBalance] = React.useState<string>('0')
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
      handleGetTransactions()
    }
  }, [repo])
  console.log({ reserveTokenBalance })
  React.useEffect(() => {
    setAmount('')
  }, [selectedSide])

  React.useEffect(() => {
    if (curveState.maxSupply && curveState.fundingGoal) {
      setProgress((+curveState.reserveBalance / +curveState.fundingGoal) * 100)
      handleGetTokenHoldersBalances()
    }
  }, [curveState])

  React.useEffect(() => {
    if (amount) {
      handleGetBuyPrice()
    }
  }, [amount])

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

  async function handleGetTransactions() {
    if (!repo || !repo.bondingCurve || !repo.token) return

    const chart: ChartData[] = []

    const transactions = await getBuySellTransactionsOfCurve(repo.bondingCurve.processId!)

    transactions.forEach((transaction: any) => {
      const costTag = transaction.node.tags.find((tag: any) => tag.name === 'Cost')
      const tokensSoldTag = transaction.node.tags.find((tag: any) => tag.name === 'TokensSold')
      const tokensBoughtTag = transaction.node.tags.find((tag: any) => tag.name === 'TokensBought')

      const cost = costTag ? parseInt(costTag.value) : 0
      const tokensSold = tokensSoldTag ? parseInt(tokensSoldTag.value) : 0
      const tokensBought = tokensBoughtTag ? parseInt(tokensBoughtTag.value) : 0
      let price = 0
      // Calculate price based on transaction type
      if (tokensBought > 0) {
        // Buy transaction: Price = Cost / TokensBought
        price = cost / (tokensBought * 10 ** +repo.token!.denomination)
      } else if (tokensSold > 0) {
        // Sell transaction: Price = Proceeds / TokensSold
        price = cost / (tokensSold * 10 ** +repo.token!.denomination)
      } else {
        // If no tokens were bought or sold, skip this transaction as it doesn't affect the price
        return
      }

      price = parseFloat(
        parseScientific(roundToSignificantFigures(price, +repo.bondingCurve!.reserveToken.denomination).toString())
      )
      const timestamp = transaction.node.ingested_at * 1000 || 0
      chart.push({
        time: timestamp,
        value: price
      })
    })
    setChartData(chart)
  }

  async function handleGetCurveState() {
    if (!repo?.bondingCurve) return

    const state = await getCurveState(repo.bondingCurve.processId!)
    setCurveState(state)
  }

  function handleTokenSwitch() {
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

  const debouncedSetAmount = React.useCallback(
    debounce((value: string) => {
      setAmount(value)
    }, 500),
    []
  )

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    debouncedSetAmount(e.target.value)
  }

  async function handleGetBuyPrice() {
    if (!amount || !repo?.bondingCurve || !curveState.maxSupply || !curveState.fundingGoal) return

    let price = 0
    const currentSupply = await getTokenCurrentSupply(repo.token!.processId!)
    if (selectedSide === 'buy') {
      const tokensToBuy = +amount
      // price = await calculateTokensBuyCost(
      //   repo.token!.processId!,
      //   tokensToBuy,
      //   +curveState.maxSupply,
      //   +curveState.fundingGoal
      // )

      price = await getTokenBuyPrice(tokensToBuy.toString(), currentSupply, repo.bondingCurve.processId!)
    }
    if (selectedSide === 'sell') {
      const tokensToSell = +amount * 10 ** +repo.token!.denomination
      price = await calculateTokensSellCost(
        repo.token!.processId!,
        tokensToSell,
        +curveState.maxSupply,
        +curveState.fundingGoal
      )
    }
    setPriceUnscaled(price.toString())
    const priceUnscaled = price / 10 ** +repo.bondingCurve.reserveToken.denomination
    const formattedPrice = parseScientific(
      roundToSignificantFigures(priceUnscaled, +repo.bondingCurve.reserveToken.denomination).toString()
    )

    setPrice(formattedPrice || '')
  }

  function roundToSignificantFigures(num: number, sig: number) {
    if (num === 0) {
      return 0
    }
    const d = Math.ceil(Math.log10(Math.abs(num)))
    const power = sig - d
    const mult = Math.pow(10, power)
    return Math.floor(num * mult + 0.5) / mult
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
        amount,
        priceUnscaled
      )
      if (success) {
        toast.success('Tokens bought successfully.')
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
      const { success } = await sellTokens(repo.bondingCurve.processId!, amount)
      if (success) {
        toast.success('Tokens bought successfully.')
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

  const selectedToken = tokenPair[selectedTokenToTransact]
  if (!repo || !selectedToken) return null
  console.log({ curveState })
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
              <DialogPanel className="w-full max-w-[1200px] h-[800px] transform rounded-2xl bg-gray-50 p-6 text-left align-middle shadow-xl transition-all">
                <div className="w-full flex justify-between align-middle">
                  <DialogTitle as="h3" className="text-xl font-medium text-gray-900">
                    Trade {repo.token?.tokenName} ({repo.token?.tokenTicker})
                  </DialogTitle>
                  <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
                </div>

                <div className="mt-6 flex h-[700px] gap-8">
                  {/* TradingView Chart Section - 70% */}
                  <div className="w-[70%]">
                    <TradeChartComponent data={chartData} />
                  </div>

                  {/* Buy/Sell Widget Section - 30% */}
                  <div className="w-[30%] bg-white rounded-lg shadow-md p-4 flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                      <h1 className="text-base text-gray-600 font-medium">Funding Goal Progress</h1>
                      <Progress
                        height="18px"
                        labelClassName="text-white text-sm pr-2"
                        bgColor="#56ADD9"
                        completed={progress}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedSide('buy')}
                          className="w-1/2 justify-center font-medium !py-2"
                          variant={selectedSide === 'buy' ? 'primary-solid' : 'primary-outline'}
                        >
                          Buy
                        </Button>
                        <Button
                          onClick={() => setSelectedSide('sell')}
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
                                className="text-sm px-2 py-1 cursor-pointer hover:bg-primary-700 rounded-md bg-primary-600 text-white"
                              >
                                Switch to $
                                {selectedTokenToTransact === 0 ? tokenPair[1]?.tokenTicker : tokenPair[0]?.tokenTicker}
                              </div>
                            </div>
                          </div>
                          <div className="flex w-full relative items-center pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                            <input
                              onChange={handleAmountChange}
                              className="w-full focus:outline-none  px-3 flex-1"
                              type="number"
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

                        {price && (
                          <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600">Price</label>
                            <div className="text-base flex items-center gap-1 font-medium text-gray-600">
                              {price} {repo?.bondingCurve?.reserveToken.tokenTicker}{' '}
                              <img
                                className="w-6 h-6"
                                src={imgUrlFormatter(repo?.bondingCurve?.reserveToken.tokenImage || '')}
                              />
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
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
