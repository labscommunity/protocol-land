import { getTags } from '@/helpers/getTags'

import { sendMessage } from '../contract'
import { pollForTxBeingAvailable } from '../decentralize'
import { pollSellTokensMessages } from '.'
import { N_PLUS_1 } from './constants'
import { getTokenCurrentSupply } from './helpers'

export async function calculateTokensSellCost(
  repoTokenPID: string,
  tokensToSell: number,
  fundingGoal: number,
  supplyToSell: number
): Promise<number> {
  // Fetch the current supply
  const currentSupply = await getTokenCurrentSupply(repoTokenPID)
  const s1 = parseInt(currentSupply)

  // Correct the calculation by subtracting tokensToSell
  const s2 = s1 - tokensToSell

  if (s2 < 0) {
    throw new Error('Supply cannot go below zero')
  }

  const S_exp = Math.pow(supplyToSell, N_PLUS_1)

  // Calculate s1_exp and s2_exp, scaling if necessary
  const s1_exp = Math.pow(s1, N_PLUS_1)
  const s2_exp = Math.pow(s2, N_PLUS_1)

  // Calculate the proceeds
  const numerator = fundingGoal * (s1_exp - s2_exp)
  const proceeds = numerator / S_exp

  return proceeds
}

export async function sellTokens(bondingCurvePID: string, tokensToSell: string) {
  console.log('sellTokens', bondingCurvePID, tokensToSell)

  const args = {
    tags: getTags({
      Action: 'Sell-Tokens',
      'Token-Quantity': tokensToSell
    }),
    pid: bondingCurvePID
  }

  const msgId = await sendMessage(args)
  await pollForTxBeingAvailable({ txId: msgId })

  const { success, message } = await pollSellTokensMessages(msgId)
  return { success, message }
}
