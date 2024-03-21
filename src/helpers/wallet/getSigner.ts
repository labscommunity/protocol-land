import * as othentSigner from '@othent/kms'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { useGlobalStore } from '@/stores/globalStore'

export async function getSigner({ injectedSigner } = { injectedSigner: true }) {
  const strategy = useGlobalStore.getState().authState.method
  let wallet: any = window.arweaveWallet

  if (strategy === 'othent') {
    wallet = Object.assign({}, othentSigner, {
      getActiveAddress: () => othentSigner.getActiveKey(),
      getAddress: () => othentSigner.getActiveKey(),
      signer: (tx: any) => othentSigner.sign(tx),
      type: 'arweave'
    })
  }

  if (!injectedSigner) return wallet

  const userSigner = new InjectedArweaveSigner(wallet)
  await userSigner.setPublicKey()

  return userSigner
}
