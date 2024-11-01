import { MdError } from 'react-icons/md'

import { RepoLiquidityPoolToken } from '@/types/repository'

export const ERROR_MESSAGE_TYPES = {
  'error-generic': {
    title: 'Error',
    description: 'An error occurred while trying to tokenize the repository.',
    icon: MdError,
    actionText: 'Try Again'
  },
  'error-no-token': {
    title: 'Incomplete Token Settings',
    description: 'You need to complete the token settings to tokenize the repository.',
    icon: MdError,
    actionText: 'Complete Token Settings'
  },
  'error-no-bonding-curve': {
    title: 'Incomplete Bonding Curve Settings',
    description: 'You need to complete the bonding curve settings to tokenize the repository.',
    icon: MdError,
    actionText: 'Complete Bonding Curve Settings'
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
