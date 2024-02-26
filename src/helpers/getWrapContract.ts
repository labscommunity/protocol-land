import { WarpFactory } from 'warp-contracts'
import { DeployPlugin } from 'warp-contracts-plugin-deploy'

const warp = WarpFactory.forMainnet().use(new DeployPlugin())
const IS_DRE_SYNCED_KEY = 'is_pl_dre_synced'
let IS_DRE_SYNCED = false

export default async function getWarpContract(contractTxId: string, signer?: any) {
  const contract = warp.contract(contractTxId)
  const isDRESynced = IS_DRE_SYNCED || localStorage.getItem(IS_DRE_SYNCED_KEY) === 'true'

  if (!isDRESynced) {
    await contract
      .syncState('https://dre-1.warp.cc/contract', { validity: true })
      .then(() => {
        IS_DRE_SYNCED = true
        localStorage.setItem(IS_DRE_SYNCED_KEY, 'true')
      })
      .catch((err: any) => console.log('DRE Sync Error: ', err?.message))
  }

  if (signer) {
    return contract.connect(signer)
  }

  return contract
}
