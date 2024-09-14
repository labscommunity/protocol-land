import { connect, createDataItemSigner } from '@permaweb/aoconnect'

const { result, results, message, spawn, monitor, unmonitor, dryrun } = connect({
  MU_URL: 'https://mu.ao-testnet.xyz',
  CU_URL: 'https://cu63.ao-testnet.xyz',
  GATEWAY_URL: 'https://arweave.net'
})

export { createDataItemSigner, dryrun, message, monitor, result, results, spawn, unmonitor }
