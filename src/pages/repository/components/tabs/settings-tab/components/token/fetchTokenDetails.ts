import { dryrun } from '@/helpers/aoconnect'
import { getTags } from '@/helpers/getTags'

export async function fetchTokenDetails(pid: string) {
  const { Messages } = await dryrun({
    process: pid,
    tags: getTags({
      Action: 'Info'
    })
  })

  if (!Messages[0]) {
    throw new Error('Token Loading Failed')
  }

  const msg = Messages[0]

  const tokenDetails = {
    tokenName: msg.Tags.find((tag: any) => tag.name === 'Name')?.value,
    tokenTicker: msg.Tags.find((tag: any) => tag.name === 'Ticker')?.value,
    tokenImage: msg.Tags.find((tag: any) => tag.name === 'Logo')?.value,
    tokenDenomination: msg.Tags.find((tag: any) => tag.name === 'Denomination')?.value,
    tokenMaxSupply: msg.Tags.find((tag: any) => tag.name === 'MaxSupply')?.value,
    tokenTotalSupply: msg.Tags.find((tag: any) => tag.name === 'TotalSupply')?.value
  }

  return tokenDetails
}
