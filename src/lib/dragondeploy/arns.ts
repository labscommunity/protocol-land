import Arweave from 'arweave'
import { WarpFactory } from 'warp-contracts'
import { DeployPlugin } from 'warp-contracts-plugin-deploy'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import getWarpContract from '@/helpers/getWrapContract'

const warp = WarpFactory.forMainnet().use(new DeployPlugin())

const REGISTRY = 'bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U'
const ANT_SOURCE = 'H2uxnw_oVIEzXeBeYmxDgJuxPqwBCGPO4OmQzdWQu3U'

const arweave = Arweave.init({})

function getWarpPstContract(contractTxId: string, signer?: any) {
  if (signer) {
    return warp.pst(contractTxId).connect(signer)
  }

  return warp.pst(contractTxId)
}

export async function searchArNSName(name: string) {
  const registry = getWarpPstContract(REGISTRY)
  const registryState = await registry.currentState()
  console.log(registryState)
  if (registryState.records[name]) {
    return { success: false, message: `ArNS Name ${name} is already taken and is not available for purchase` }
  }
  return { success: true }
}

export async function registerArNSName({
  name,
  years,
  transactionId
}: {
  name: string
  years: number
  transactionId: string
}) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const registry = getWarpPstContract(REGISTRY, userSigner)
  const registryState = await registry.currentState()
  const owner = await userSigner.getAddress()

  if (registryState.records[name]) {
    return { success: false, message: `ArNS name ${name} is already taken and is not available for purchase` }
  }

  const ioBalance = registryState.balances[owner]

  if (typeof ioBalance === 'undefined' || ioBalance < registryState.fees[name.length.toString()]) {
    return { success: false, message: `Not enough IO Test Token to purchase this name.` }
  }

  // create ANT contract
  const ant = await warp.createContract.deployFromSourceTx(
    {
      wallet: userSigner,
      initState: JSON.stringify({
        ticker: `ANT-${name.toUpperCase()}`,
        name,
        owner,
        controllers: [owner],
        evolve: null,
        records: {
          ['@']: transactionId
        },
        balances: {
          [owner]: 1
        }
      }),
      srcTxId: ANT_SOURCE
    },
    true
  )

  // buy ArNS
  await registry.writeInteraction(
    {
      function: 'buyRecord',
      name,
      contractTxId: ant.contractTxId,
      tierNumber: 1,
      years
    },
    { disableBundling: true }
  )

  return { success: true, ant, message: `Successfully registred ${name}.arweave.dev` }
}

export async function updateSubDomain({
  antContract,
  transactionId,
  subdomain = '@'
}: {
  antContract: string
  transactionId: string
  subdomain: string
}) {
  const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
  await userSigner.setPublicKey()

  const result = await getWarpContract(antContract, userSigner).writeInteraction(
    {
      function: 'setRecord',
      subDomain: subdomain,
      transactionId
    },
    { disableBundling: true, strict: true }
  )

  return { success: true, id: result.originalTxId, message: 'Successfully updated subdomain' }
}

export async function getIOBalance(owner: string) {
  const response = await fetch(`https://api.arns.app/v1/contract/${REGISTRY}/balances/${owner}`)
  return +((await response.json())?.balance ?? 0).toFixed(2)
}

export async function getArNSNameFees(name = '', years = 1) {
  if (name === '') return [0, 0]

  const response = await fetch(
    `https://api.arns.app/v1/contract/${REGISTRY}/read/priceForInteraction?interactionName=buyRecord&name=${name}&years=${years}&type=lease&contractTxId=atomic`
  )
  if (response.status !== 200) {
    throw new Error(await response.text())
  }

  const price = +((await response.json())?.result?.price ?? 0).toFixed(2)
  const fee = (await arweave.api.get(`price/${name.length}`)).data
  return [price, +arweave.ar.winstonToAr(fee, { decimals: 4 })]
}

export async function getARBalance(owner: string, decimals = true) {
  return await arweave.wallets
    .getBalance(owner)
    .then((x) => (decimals ? +arweave.ar.winstonToAr(x, { decimals: 4 }) : +arweave.ar.winstonToAr(x)))
    .catch(() => 0)
}

async function getANTsContractTxIds(owner: string) {
  const response = await fetch(`https://api.arns.app/v1/wallet/${owner}/contracts?type=ant`)
  const contractTxIds = (await response.json()).contractTxIds
  return contractTxIds as string[]
}

export async function getAllArNSNames(owner: string) {
  const contractTxIds = await getANTsContractTxIds(owner)
  if (contractTxIds.length === 0) return {}

  const url = [
    'https://api.arns.app/v1/contract/bLAgYxAdX2Ry-nt6aH2ixgvJXbpsEYm28NgJgyqfs-U/records?',
    ...contractTxIds
  ]

  const response = await fetch(url.join('&contractTxId='))
  return (await response.json()).records
}

export async function getAllANTs(owner: string) {
  const approvedSrc = [
    'H2uxnw_oVIEzXeBeYmxDgJuxPqwBCGPO4OmQzdWQu3U',
    'JIIB01pRbNK2-UyNxwQK-6eknrjENMTpTvQmB8ZDzQg',
    'PEI1efYrsX08HUwvc6y-h6TSpsNlo2r6_fWL2_GdwhY'
  ]
  const queryTarget = `
  query {
    transactions(first: 100, owners: ["${owner}"], tags: {name: "Contract-Src", values: [${approvedSrc
      .map((s) => `"${s}"`)
      .join(',')}]}) {
      edges {
        node {
          id
        }
      }
    }
  }
      `

  const query = {
    query: queryTarget
  }

  const result = await arweave.api.post('graphql', query)

  const ids = result.data.data.transactions.edges.map((edge: { node: { id: string } }) => edge.node.id)

  const ants = await Promise.all(ids.map(getANT))

  return Promise.resolve(ants.filter((rec: { subdomain: string }) => rec.subdomain !== 'not_defined'))
}

export async function getANT(ANT: any) {
  const subdomain = 'not_defined'
  try {
    const ant = await getWarpContract(ANT)
    const antState = await ant.readState().then((result: { cachedValue: { state: any } }) => result.cachedValue.state)
    return { ...antState, id: ANT, subdomain: antState.name }
  } catch (e) {
    return { id: ANT, subdomain }
  }
}
