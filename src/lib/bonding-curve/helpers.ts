import { dryrun } from '@/helpers/aoconnect'
import { getTags } from '@/helpers/getTags'
import { CurveState } from '@/stores/repository-core/types'

export async function getTokenCurrentSupply(tokenId: string) {
  const args = {
    tags: getTags({
      Action: 'Total-Supply'
    }),
    process: tokenId
  }

  const { Messages } = await dryrun(args)
  const msg = Messages[0]

  if (!msg) {
    throw new Error('Failed to get token current supply')
  }

  const actionValue = msg.Tags.find((tag: any) => tag.name === 'Action')?.value

  if (actionValue !== 'Total-Supply-Response') {
    throw new Error('Failed to get token current supply')
  }

  const supply = msg.Data

  return supply
}

export async function getCurveState(curveId: string) {
  const args = {
    tags: getTags({
      Action: 'Info'
    }),
    process: curveId
  }

  const { Messages } = await dryrun(args)
  const msg = Messages[0]

  if (!msg) {
    throw new Error('Failed to get curve state')
  }

  const actionValue = msg.Tags.find((tag: any) => tag.name === 'Action')?.value as string

  if (actionValue !== 'Info-Response') {
    throw new Error('Failed to get curve state')
  }

  const state = JSON.parse(msg.Data) as CurveState

  return state
}
