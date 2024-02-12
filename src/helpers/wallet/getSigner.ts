import * as othentSigner from '@othent/kms'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { useGlobalStore } from '@/stores/globalStore'

export async function getSigner({ forArNS } = { forArNS: false }) {
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

  if (forArNS) return wallet

  const userSigner = new InjectedArweaveSigner(wallet)
  await userSigner.setPublicKey()

  return userSigner
}
