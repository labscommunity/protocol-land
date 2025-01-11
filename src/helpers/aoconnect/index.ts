import { connect, createDataItemSigner } from '@permaweb/aoconnect'

const { result, results, message, spawn, monitor, unmonitor, dryrun } = connect({
  GATEWAY_URL: 'https://g8way.io'
})

export { createDataItemSigner, dryrun, message, monitor, result, results, spawn, unmonitor }
