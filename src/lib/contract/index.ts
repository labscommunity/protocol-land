import { createDataItemSigner, dryrun, message, result } from '@/helpers/aoconnect'
import { AOS_PROCESS_ID } from '@/helpers/constants'
import { extractMessage } from '@/helpers/extractMessage'
import { getTags } from '@/helpers/getTags'
import { getSigner } from '@/helpers/wallet/getSigner'
import { Repo } from '@/types/repository'

export type SendMessageArgs = {
  data?: string
  tags: {
    name: string
    value: string
  }[]
  anchor?: string
}

export async function getRepo(id: string) {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repo',
      Id: id
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo
  return repo
}

export async function sendMessage({ tags, data }: SendMessageArgs) {
  const signer = await getSigner({ injectedSigner: false })
  const args = {
    process: AOS_PROCESS_ID,
    tags,
    signer: createDataItemSigner(signer)
  } as any

  if (data) args.data = data

  const messageId = await message(args)

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  return messageId
}
