import { ArFS } from 'arfs-js'

export function getArFS() {
  const arfs = new ArFS({ wallet: 'use_wallet' })

  return arfs
}
