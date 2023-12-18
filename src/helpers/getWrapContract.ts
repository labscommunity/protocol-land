import { WarpFactory } from 'warp-contracts'
import { DeployPlugin } from 'warp-contracts-plugin-deploy'

const warp = WarpFactory.forMainnet().use(new DeployPlugin())
// const warp = WarpFactory.forTestnet().use(new DeployPlugin())

export default function getWarpContract(contractTxId: string, signer?: any) {
  if (signer) {
    return warp.contract(contractTxId).connect(signer)
  }

  return warp.contract(contractTxId)
}
