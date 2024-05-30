import { ArFS } from 'arfs-js'

import { arfsTxSubmissionOverride } from './arfsTxSubmissionOverride'

export function getArFS() {
  const arfs = new ArFS({ wallet: 'use_wallet', appName: 'Protocol.Land' })
  arfs.api.signAndSendAllTransactions = arfsTxSubmissionOverride

  return arfs
}
