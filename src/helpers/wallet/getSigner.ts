import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

export async function getSigner({ injectedSigner } = { injectedSigner: true }) {
  const wallet: any = window.arweaveWallet

  if (!injectedSigner) return wallet

  const userSigner = new InjectedArweaveSigner(wallet)
  await userSigner.setPublicKey()

  return userSigner
}
