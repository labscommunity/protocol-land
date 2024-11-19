import { dryrun } from '@permaweb/aoconnect'

import { getTags } from '@/helpers/getTags'
import { isArweaveAddress } from '@/helpers/isInvalidInput'
import { CreateLiquidityPoolProps } from '@/pages/repository/components/decentralize-modals/config'
import { RepoLiquidityPoolToken } from '@/types/repository'

import { sendMessage } from '../contract'
import { pollForTxBeingAvailable, pollLiquidityPoolMessages } from '../decentralize'

// export const AMM_PROCESS_ID = 'gCx8TjISuSqRTXXVab22plluBy5S0YyvxPYU5xqFqc8'
export const AMM_PROCESS_ID = '3XBGLrygs11K63F_7mldWz4veNx6Llg6hI2yZs8LKHo'

export async function checkIfLiquidityPoolExists(tokenA: RepoLiquidityPoolToken, tokenB: RepoLiquidityPoolToken) {
  const args = {
    tags: getTags({
      Action: 'Get-Pool',
      'Token-A': tokenA.processId,
      'Token-B': tokenB.processId
    }),
    process: AMM_PROCESS_ID
  }

  const { Messages } = await dryrun(args)

  if (Messages.length > 0) {
    return true
  }

  return false
}

export async function checkLiquidityPoolReserves(poolId: string) {
  const args = {
    tags: getTags({
      Action: 'Get-Reserves'
    }),
    process: poolId
  }

  let attempts = 0;
  while (attempts < 10) {
    const { Messages } = await dryrun(args)

    if (!Messages[0]) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
      continue;
    }

    let data: Record<string, string> = {}

    data = Messages[0].Tags.reduce((acc: any, curr: any) => {
      if (isArweaveAddress(curr.name)) {
        acc[curr.name] = curr.value
      }
      return acc
    }, {})

    if (Object.keys(data).length >= 2) {
      return data;
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
  }

  return null; // Return null if we couldn't get at least two entries after 10 attempts
}

export async function depositToLiquidityPool(poolId: string, token: RepoLiquidityPoolToken, amount: string) {
  const args = {
    tags: getTags({
      Action: 'Transfer',
      Recipient: poolId,
      Quantity: (+amount * 10 ** +token.denomination).toString(),
      'X-Slippage-Tolerance': '0.5',
      'X-Action': 'Provide'
    }),
    pid: token.processId
  }

  const msgId = await sendMessage(args)

  return msgId
}

export async function createLiquidityPool(payload: CreateLiquidityPoolProps) {
  const { tokenA, tokenB } = payload

  const args = {
    tags: getTags({
      Action: 'Add-Pool',
      'Token-A': tokenA.processId,
      'Token-B': tokenB.processId,
      Name: `Bark v2 Pool ${tokenA.processId.slice(0, 6)}...${tokenB.processId.slice(-6)}`
    }),
    pid: AMM_PROCESS_ID
  }

  const msgId = await sendMessage(args)
  await pollForTxBeingAvailable({ txId: msgId })

  const poolStatus = await pollLiquidityPoolMessages(msgId)

  return poolStatus
}