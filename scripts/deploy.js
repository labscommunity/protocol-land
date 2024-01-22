// script to deploy contract source

// imports
import fs from 'fs'
import path from 'path'
import { WarpFactory } from 'warp-contracts'
import { ArweaveSigner, DeployPlugin } from 'warp-contracts-plugin-deploy'

// intiating new warp instance for mainnet
const warp = WarpFactory.forMainnet().use(new DeployPlugin())
const evolve = process.argv.indexOf('--evolve') > -1

// read private key file
// *store with name 'wallet.json' in root direstory of project if needed
const key = JSON.parse(fs.readFileSync('wallet.json').toString())

// get absolute path for project directory
const __dirname = path.resolve()

// read contract source logic from 'handle.js' and encode it
const state = fs.readFileSync(path.join(__dirname, 'warp/protocol-land/initial-state.json'), 'utf-8')
const contractSource = fs.readFileSync(path.join(__dirname, 'contracts-dist/repository-contract.js'), 'utf-8')
const contract = warp.contract('n51BrXCw3iHPDlynA6RrxpVnLkR45iwWs8Q0YB7tLVI').connect(key)

if (evolve) {
  const newSource = await warp.createSource({ src: contractSource }, new ArweaveSigner(key))
  const newSrcId = await warp.saveSource(newSource)

  await contract.evolve(newSrcId)

  console.log('Evolved Source Contract Id', newSrcId)
} else {
  const { contractTxId } = await warp.createContract.deploy({
    wallet: new ArweaveSigner(key),
    initState: state,
    src: contractSource
  })

  // log new function source's transaction id
  console.log('New Source Contract Id', contractTxId)
}
// function create new contract source
