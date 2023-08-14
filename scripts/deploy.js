// script to deploy contract source

// imports
import fs from 'fs'
import path from 'path'
import { WarpFactory } from 'warp-contracts'
import { ArweaveSigner, DeployPlugin } from 'warp-contracts-plugin-deploy'

// intiating new warp instance for mainnet
const warp = WarpFactory.forMainnet().use(new DeployPlugin())

// read private key file
// *store with name 'wallet.json' in root direstory of project if needed
const key = JSON.parse(fs.readFileSync('wallet.json').toString())

// get absolute path for project directory
const __dirname = path.resolve()

// read contract source logic from 'handle.js' and encode it
const contractSource = fs.readFileSync(path.join(__dirname, 'contracts-dist/repository-contract.js'), 'utf-8')

// function create new contract source
const newSource = await warp.createSource({ src: contractSource }, new ArweaveSigner(key))
const newSrcId = await warp.saveSource(newSource)

// log new function source's transaction id
console.log('New Source Contract Id', newSrcId)
