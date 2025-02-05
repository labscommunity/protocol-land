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
    denomination: msg.Tags.find((tag: any) => tag.name === 'Denomination')?.value,
    maxSupply: msg.Tags.find((tag: any) => tag.name === 'MaxSupply')?.value,
    totalSupply: msg.Tags.find((tag: any) => tag.name === 'TotalSupply')?.value
  }

  return tokenDetails
}
