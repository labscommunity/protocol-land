import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import numeral from 'numeral'
import { Fragment, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { HiChevronUpDown } from 'react-icons/hi2'
import { IoCheckmark } from 'react-icons/io5'

import { Button } from '@/components/common/buttons'
import { fetchAllUserTokens } from '@/helpers/wallet/fetchAllTokens'
import { fetchTokenBalance } from '@/lib/decentralize'
import { useGlobalStore } from '@/stores/globalStore'
import { RepoLiquidityPool, RepoLiquidityPoolToken } from '@/types/repository'

import { CreateLiquidityPoolProps } from './config'

type Props = {
  onClose: () => void
  liquidityPool: RepoLiquidityPool
  onAction: (payload: CreateLiquidityPoolProps) => Promise<void>
}

// const USDA_TST = {
//   tokenName: 'Astro USD (Test)',
//   tokenTicker: 'USDA-TST',
//   processId: 'GcFxqTQnKHcr304qnOcq00ZqbaYGDn4Wbb0DHAM-wvU',
//   denomination: '12',
//   tokenImage: 'K8nurc9H0_ZQm17jbs3ryEs6MrlX-oIK_krpprWlQ-Q'
// }

// const MOCK_USDA = {
//   tokenName: 'USDA Mock',
//   tokenTicker: 'TUSDA',
//   processId: 'b87Jd4usKGyMjovbNeX4P3dcvkC4mrtBZ5HxW_ENtn4',
//   denomination: '12',
//   tokenImage: 'TPkPIvnvWuyd-hv8J1IAdUlb8aii00Z7vjwMBk_kp0M'
// }

const QAR = {
  tokenName: 'Q Arweave',
  tokenTicker: 'qAR',
  // processId: 'b87Jd4usKGyMjovbNeX4P3dcvkC4mrtBZ5HxW_ENtn4',
  processId: 'NG-0lVX882MG5nhARrSzyprEK6ejonHpdUmaaMPsHE8',
  denomination: '12',
  tokenImage: '26yDr08SuwvNQ4VnhAfV4IjJcOOlQ4tAQLc1ggrCPu0'
}

export default function TokenizedLiquidityPool({ onClose, liquidityPool, onAction }: Props) {
  const [errors, setErrors] = useState<{
    baseTokenAmount: string
    quoteTokenAmount: string
  }>({
    baseTokenAmount: '',
    quoteTokenAmount: ''
  })
  const [address] = useGlobalStore((state) => [state.authState.address])
  const [isTokenListLoading, setIsTokenListLoading] = useState(true)
  const [tokenList, setTokenList] = useState<(typeof QAR)[]>([QAR])
  const [selectedQuoteToken, setSelectedQuoteToken] = useState(() => {
    if (liquidityPool) {
      return liquidityPool.quoteToken
    }
    return QAR
  })
  const [baseTokenAmount, setBaseTokenAmount] = useState('')
  const [baseTokenBalance, setBaseTokenBalance] = useState(0)
  const [quoteTokenAmount, setQuoteTokenAmount] = useState('')
  const [quoteTokenBalance, setQuoteTokenBalance] = useState(0)

  useEffect(() => {
    fetchAllUserTokens().then((tokens) => {
      setTokenList(tokens)
      setIsTokenListLoading(false)
    })
    if (liquidityPool) {
      getBalance(liquidityPool.baseToken, liquidityPool.quoteToken)
    }
  }, [])

  useEffect(() => {
    if (liquidityPool) {
      getBalance(liquidityPool.baseToken, liquidityPool.quoteToken)
      setSelectedQuoteToken(liquidityPool.quoteToken)
    }
  }, [])

  useEffect(() => {
    if (selectedQuoteToken) {
      fetchTokenBalance(selectedQuoteToken.processId, address!).then((balance) => {
        setQuoteTokenBalance(+balance / 10 ** +selectedQuoteToken.denomination)
      })
    }
  }, [selectedQuoteToken])

  useEffect(() => {
    if (parseFloat(baseTokenAmount) > baseTokenBalance) {
      setErrors((prev) => ({ ...prev, baseTokenAmount: 'Balance is too low' }))
    } else {
      setErrors((prev) => ({ ...prev, baseTokenAmount: '' }))
    }

    if (parseFloat(quoteTokenAmount) > quoteTokenBalance) {
      setErrors((prev) => ({ ...prev, quoteTokenAmount: 'Balance is too low' }))
    } else {
      setErrors((prev) => ({ ...prev, quoteTokenAmount: '' }))
    }
  }, [baseTokenAmount, baseTokenBalance, quoteTokenAmount, quoteTokenBalance])

  async function getBalance(baseToken: RepoLiquidityPoolToken, quoteToken: RepoLiquidityPoolToken) {
    const baseTokenBalance = await fetchTokenBalance(baseToken.processId, address!)
    const quoteTokenBalance = await fetchTokenBalance(quoteToken.processId, address!)

    setBaseTokenBalance(+baseTokenBalance / 10 ** +baseToken.denomination)
    setQuoteTokenBalance(+quoteTokenBalance / 10 ** +quoteToken.denomination)
  }

  async function handleSubmit() {
    if (!baseTokenAmount || !quoteTokenAmount) {
      toast.error('Please enter an amount for both tokens')
      return
    }

    if (errors.baseTokenAmount || errors.quoteTokenAmount) {
      return
    }

    try {
      onAction({
        tokenA: liquidityPool.baseToken,
        tokenB: selectedQuoteToken,
        amountA: baseTokenAmount,
        amountB: quoteTokenAmount,
        balanceA: baseTokenBalance.toString(),
        balanceB: quoteTokenBalance.toString()
      })
    } catch (error) {
      console.log({ error })
    }
  }

  const { baseToken } = liquidityPool
  return (
    <>
      <div className="mt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label>Base Token</label>
              <div className="flex items-center gap-1">
                <p className="text-sm text-gray-600">
                  Balance: <span className="font-medium">{numeral(baseTokenBalance).format('0')}</span>
                </p>
              </div>
            </div>
            <Listbox disabled={true}>
              <div className="relative mt-1">
                <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span className="block truncate">{baseToken?.tokenTicker}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <HiChevronUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </ListboxButton>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                    {tokenList.map((token) => (
                      <ListboxOption
                        key={token.processId}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-primary-100' : 'text-gray-900'
                          }`
                        }
                        value={token}
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {token.tokenTicker}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-700">
                                <IoCheckmark className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Transition>
              </div>
            </Listbox>
          </div>
          <div className="flex flex-col gap-1">
            <label>Amount</label>
            <input
              value={baseTokenAmount === '0' ? '' : baseTokenAmount}
              onChange={(e) => {
                const value = e.target.value
                const regex = /^[0-9]*[.]?[0-9]*$/
                if (regex.test(value)) {
                  setBaseTokenAmount(value)
                }
              }}
              type="text"
              className="outline-none w-full bg-transparent text-3xl"
              placeholder="0"
            />
            {errors.baseTokenAmount && <p className="text-red-500 text-sm italic">{errors.baseTokenAmount}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label>Quote Token</label>
              <div className="flex items-center">
                <p className="text-sm text-gray-600">
                  Balance: <span className="font-medium">{numeral(quoteTokenBalance).format('0')}</span>
                </p>
              </div>
            </div>
            <Listbox onChange={(value: RepoLiquidityPoolToken) => setSelectedQuoteToken(value)}>
              <div className="relative mt-1">
                <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span className="block truncate">
                    {isTokenListLoading ? 'Loading...' : selectedQuoteToken?.tokenTicker}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <HiChevronUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </ListboxButton>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <ListboxOptions className="z-[20] absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                    {tokenList.map((token) => (
                      <ListboxOption
                        key={token.processId}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-primary-100' : 'text-gray-900'
                          }`
                        }
                        value={token}
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {token.tokenTicker}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-700">
                                <IoCheckmark className="h-5 w-5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </Transition>
              </div>
            </Listbox>
          </div>
          <div className="flex flex-col gap-1">
            <label>Amount</label>
            <input
              value={quoteTokenAmount === '0' ? '' : quoteTokenAmount}
              onChange={(e) => {
                const value = e.target.value
                const regex = /^[0-9]*[.]?[0-9]*$/
                if (regex.test(value)) {
                  setQuoteTokenAmount(value)
                }
              }}
              type="text"
              className="outline-none w-full bg-transparent text-3xl"
              placeholder="0"
            />
            {errors.quoteTokenAmount && <p className="text-red-500 text-sm italic">{errors.quoteTokenAmount}</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Button className="w-full justify-center font-medium" onClick={handleSubmit} variant="primary-solid">
          Create Liquidity Pool
        </Button>
        <Button className="w-full justify-center font-medium" onClick={onClose} variant="primary-outline">
          Close
        </Button>
      </div>
    </>
  )
}
