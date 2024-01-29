import { getActivePublicKey as getActivePublicKeyOthent } from '@othent/kms'

import { useGlobalStore } from '@/stores/globalStore'

export async function getActivePublicKey() {
  const strategy = useGlobalStore.getState().authState.method

  if (strategy === 'othent') {
    return getActivePublicKeyOthent()
  }

  return window.arweaveWallet.getActivePublicKey()
}
