import { getTags } from '@/helpers/getTags'

import { sendMessage } from '../contract'
import { pollForTxBeingAvailable } from '../decentralize'
import { pollBuyTokensMessages } from '.'
import { N_PLUS_1 } from './constants'
import { getTokenCurrentSupply } from './helpers'

export async function calculateTokensBuyCost(
  repoTokenPID: string,
  tokensToBuy: number,
  maxSupply: number,
  fundingGoal: number
): Promise<number> {
  const currentSupply = await getTokenCurrentSupply(repoTokenPID)
  const s1 = parseInt(currentSupply)
  const s2 = s1 + tokensToBuy

  if (s2 > maxSupply) {
    throw new Error('Cannot exceed maximum supply')
  }

  const S_exp = Math.pow(maxSupply, N_PLUS_1)

  if (S_exp <= 0) {
    throw new Error('S_exp must be greater than zero')
  }

  // Cost = G * [ (s2)^(n+1) - (s1)^(n+1) ] / S^(n+1)
  const s1_exp = Math.pow(s1, N_PLUS_1)
  const s2_exp = Math.pow(s2, N_PLUS_1)

  const numerator = fundingGoal * (s2_exp - s1_exp)
  const cost = numerator / S_exp

  return cost
}

export async function buyTokens(bondingCurvePID: string, reserveTokenPID: string, tokensToBuy: string, cost: string) {
  console.log('buyTokens', bondingCurvePID, tokensToBuy, cost)

  const args = {
    tags: getTags({
      'X-Action': 'Buy-Tokens',
      'X-Token-Quantity': tokensToBuy,
      Action: 'Transfer',
      Quantity: cost,
      Recipient: bondingCurvePID
    }),
    pid: reserveTokenPID
  }

  const msgId = await sendMessage(args)
  await pollForTxBeingAvailable({ txId: msgId })

  const { success, message } = await pollBuyTokensMessages(msgId)
  return { success, message }
}

export async function calculateTokensToSell(
  repoTokenPID: string,
  tokensToSell: number,
  maxSupply: number,
  fundingGoal: number
): Promise<number> {
  const currentSupply = await getTokenCurrentSupply(repoTokenPID)

  const s1 = currentSupply
  const s2 = currentSupply - tokensToSell

  if (s2 < 0) {
    throw new Error('Cannot sell more tokens than current supply')
  }

  const S_exp = Math.pow(maxSupply, N_PLUS_1)

  if (S_exp <= 0) {
    throw new Error('S_exp must be greater than zero')
  }

  // Reserve received = G * [ (s1)^(n+1) - (s2)^(n+1) ] / S^(n+1)
  const s1_exp = Math.pow(s1, N_PLUS_1)
  const s2_exp = Math.pow(s2, N_PLUS_1)

  const numerator = fundingGoal * (s1_exp - s2_exp)
  const reserveReceived = numerator / S_exp

  return reserveReceived
}
