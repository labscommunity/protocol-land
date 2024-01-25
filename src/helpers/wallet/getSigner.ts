import * as othentSigner from '@othent/kms'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { useGlobalStore } from '@/stores/globalStore'

export async function getSigner() {
  const strategy = useGlobalStore.getState().authState.method
  let wallet: any = window.arweaveWallet

  if (strategy === 'othent') {
    wallet = othentSigner
  }

  const userSigner = new InjectedArweaveSigner(wallet)
  await userSigner.setPublicKey()

  return userSigner
}
