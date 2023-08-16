import { WarpFactory } from 'warp-contracts'
import { DeployPlugin } from 'warp-contracts-plugin-deploy'

const warp = WarpFactory.forMainnet().use(new DeployPlugin())

export default function getWarpContract(contractTxId: string, signer: any) {
  return warp.contract(contractTxId).connect(signer)
}
