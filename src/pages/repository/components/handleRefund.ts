import { getTags } from '@/helpers/getTags'
import { sendMessage } from '@/lib/contract'
import { pollForTxBeingAvailable } from '@/lib/decentralize'

export async function handleRefund(pid: string) {
  const data = `
    ao.send({
        Target = ReserveToken.processId,
        Action = "Transfer",
        Quantity = ReserveBalance,
        Recipient = Creator
    }).receive()
    `
  const args = {
    tags: getTags({
      Action: 'Eval'
    }),
    data,
    pid
  }

  const msgId = await sendMessage(args)
  await pollForTxBeingAvailable({ txId: msgId })
}
