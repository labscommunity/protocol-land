import { WarpFactory } from 'warp-contracts'
import { DeployPlugin } from 'warp-contracts-plugin-deploy'

const warp = WarpFactory.forMainnet().use(new DeployPlugin())

export default async function getWarpContract(contractTxId: string, signer?: any) {
  const contract = warp.contract(contractTxId)

  await contract
    .syncState('https://dre-1.warp.cc/contract', { validity: true })
    .catch((err: any) => console.log('DRE Sync Error: ', err?.message))

  if (signer) {
    return contract.connect(signer)
  }

  return contract
}
