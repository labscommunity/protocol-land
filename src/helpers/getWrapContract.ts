import { WarpFactory } from 'warp-contracts'
import { DeployPlugin } from 'warp-contracts-plugin-deploy'

const warp = WarpFactory.forMainnet().use(new DeployPlugin())

const CACHE_URL = 'https://pl-cache.saikranthi.dev/contract'
const IS_DRE_SYNCED_KEY = 'is_pl_dre_synced'
let IS_DRE_SYNCED = false
let syncPromise: Promise<void> | null = null

export default async function getWarpContract(contractTxId: string, signer?: any) {
  const contract = warp.contract(contractTxId)
  IS_DRE_SYNCED = IS_DRE_SYNCED || localStorage.getItem(IS_DRE_SYNCED_KEY) === 'true'

  if (!IS_DRE_SYNCED) {
    if (!syncPromise) {
      syncPromise = contract
        .syncState(CACHE_URL, { validity: true })
        .catch((err: any) => console.log('DRE Sync Error: ', err?.message))
        .finally(() => {
          IS_DRE_SYNCED = true
          localStorage.setItem(IS_DRE_SYNCED_KEY, 'true')
          syncPromise = null
        })
    }

    await syncPromise
  }

  if (signer) {
    return contract.connect(signer)
  }

  return contract
}
