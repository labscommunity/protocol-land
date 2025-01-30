import { connect, createDataItemSigner } from '@permaweb/aoconnect'

const { result, results, message, spawn, monitor, unmonitor, dryrun } = connect()

export { createDataItemSigner, dryrun, message, monitor, result, results, spawn, unmonitor }
