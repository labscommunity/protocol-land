import { motion } from 'framer-motion'
import { FaPlus } from 'react-icons/fa'

import { Button } from '@/components/common/buttons'
import { imgUrlFormatter } from '@/helpers/imgUrlFormatter'

import { CreateLiquidityPoolProps } from './config'

type Props = {
  poolId: string
  onClose: () => void
  liquidityPoolPayload: CreateLiquidityPoolProps | null
}


export default function LiquidityPoolSuccess({ onClose, liquidityPoolPayload, poolId }: Props) {
  liquidityPoolPayload
  if (!liquidityPoolPayload) return null

  const { tokenA, tokenB, amountA, amountB } = liquidityPoolPayload
  return (
    <>
      <div className="mt-6 flex flex-col gap-2.5">
        <div className="flex flex-col items-center w-full justify-center gap-3">
          <div className="flex relative w-full max-w-[60%] justify-between items-center">
            <motion.img
              initial={{ x: 0, y: 0 }}
              animate={{ x: 130, y: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'mirror', // Moves back and forth
                ease: 'easeInOut'
              }}
              src={imgUrlFormatter(tokenA.tokenImage)}
              alt="Token 1"
              className="w-20 h-20 rounded-full"
            />
            <motion.img
              initial={{ x: 0, y: 0 }}
              animate={{ x: -130, y: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'mirror', // Moves back and forth
                ease: 'easeInOut'
              }}
              src={imgUrlFormatter(tokenA.tokenImage)}
              alt="Token 1"
              className="w-20 h-20 rounded-full"
            />
          </div>
          <div className="flex flex-col gap-3 items-center">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <h1 className="text-xl font-medium text-gray-800">{tokenA.tokenTicker}</h1>
                <p className="text-gray-700 text-lg">{amountA}</p>
              </div>
              <FaPlus />
              <div className="flex flex-col items-center">
                <h1 className="text-xl font-medium text-gray-800">{tokenB.tokenTicker}</h1>
                <p className="text-gray-700 text-lg">{amountB}</p>
              </div>
            </div>
            <p className="text-gray-500 text-center leading-5">
              Liquidity Pool for the above tokens has been created successfully. You can trade these tokens now on Bark.
              View it on{' '}
              <a
                href={`https://ao.link/#/entity/${poolId}`}
                target="_blank"
                className="text-primary-600 font-medium underline"
              >
                ao.link
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Button
          className="w-full justify-center font-medium"
          onClick={() => window.open(`https://bark-interface.vercel.app/#/pools`, '_blank')}
          variant="primary-solid"
        >
          Trade on Bark
        </Button>
        <Button className="w-full justify-center font-medium" onClick={onClose} variant="primary-outline">
          Close
        </Button>
      </div>
    </>
  )
}
