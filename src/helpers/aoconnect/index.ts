import { connect, createDataItemSigner } from '@permaweb/aoconnect'

const { result, results, message, spawn, monitor, unmonitor, dryrun } = connect({
  GATEWAY_URL: 'https://arweave.net',
  CU_URL: 'https://cu.ardrive.io'
})

export { createDataItemSigner, dryrun, message, monitor, result, results, spawn, unmonitor }
