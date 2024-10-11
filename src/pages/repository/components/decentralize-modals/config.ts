import { MdError } from 'react-icons/md'

import { RepoLiquidityPoolToken } from '@/types/repository'

export const ERROR_MESSAGE_TYPES = {
  'error-generic': {
    title: 'Error',
    description: 'An error occurred while trying to decentralize the repository.',
    icon: MdError,
    actionText: 'Try Again'
  },
  'error-no-token': {
    title: 'Incomplete Token Settings',
    description: 'You need to complete the token settings to decentralize the repository.',
    icon: MdError,
    actionText: 'Complete Token Settings'
  },
  'error-liquidity-pool': {
    title: 'Liquidity Pool Error',
    description: 'An error occurred while trying to create the liquidity pool.',
    icon: MdError,
    actionText: 'Retry'
  }
}

export type ErrorMessageTypes = keyof typeof ERROR_MESSAGE_TYPES

export type CreateLiquidityPoolProps = {
  tokenA: RepoLiquidityPoolToken
  tokenB: RepoLiquidityPoolToken
  amountA: string
  amountB: string
  balanceA: string
  balanceB: string
}
