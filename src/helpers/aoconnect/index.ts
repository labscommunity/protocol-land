import { connect, createDataItemSigner } from '@permaweb/aoconnect'

const { result, results, message, spawn, monitor, unmonitor, dryrun } = connect({
  GATEWAY_URL: 'https://arweave-search.goldsky.com'
})

export { createDataItemSigner, dryrun, message, monitor, result, results, spawn, unmonitor }
