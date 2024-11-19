import { dryrun, result } from '@permaweb/aoconnect'
import { Tag } from 'arweave/web/lib/transaction'

import { AOS_PROCESS_ID } from '@/helpers/constants'
import { getTags } from '@/helpers/getTags'
import { getRepo, sendMessage } from '@/lib/contract'
import { pollForTxBeingAvailable } from '@/lib/decentralize'
import { useGlobalStore } from '@/stores/globalStore'
import { BondingCurve, Repo, RepoToken } from '@/types/repository'
// Repo Meta

export const getRepositoryMetaFromContract = async (id: string): Promise<{ result: Repo }> => {
  const repo = await getRepo(id)
  return { result: repo }
}

export const isRepositoryNameAvailable = async (name: string): Promise<boolean> => {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repo-Availability',
      Name: name
    }),
    Owner: useGlobalStore.getState().authState.address as string
  })

  return JSON.parse(Messages[0].Data).result
}

export const searchRepositories = async (query: string): Promise<{ result: Repo[] }> => {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Get-Repos-By-Name', Query: query })
  })

  return JSON.parse(Messages[0].Data)
}

export const handleAcceptContributor = async (
  id: string,
  visibility: string,
  privateStateTxId: string | null,
  ghSyncPrivateStateTxId: string | null
) => {
  //rotate keys
  const tags = {
    Action: 'Accept-Contributor-Invite',
    Id: id,
    Visibility: visibility
  } as any

  if (privateStateTxId) {
    tags['Private-State-TxId'] = privateStateTxId
  }

  if (ghSyncPrivateStateTxId) {
    tags['GhSync-Private-State-TxId'] = ghSyncPrivateStateTxId
  }

  await sendMessage({ tags: getTags(tags) })

  const repo = await getRepo(id)

  return { contributorInvites: repo.contributorInvites, contributors: repo.contributors, githubSync: repo.githubSync }
}

export const handleRejectContributor = async (id: string) => {
  //rotate keys
  await sendMessage({
    tags: getTags({
      Action: 'Reject-Contributor-Invite',
      Id: id
    })
  })

  const repo = await getRepo(id)

  return { contributorInvites: repo.contributorInvites, contributors: repo.contributors }
}

export const handleCancelContributorInvite = async (id: string, contributor: string) => {
  //rotate keys
  await sendMessage({
    tags: getTags({
      Action: 'Cancel-Contributor-Invite',
      Id: id,
      Contributor: contributor
    })
  })

  const repo = await getRepo(id)

  return repo.contributorInvites
}

export const handleSaveRepoToken = async (id: string, repoToken: Partial<RepoToken>, address: string) => {
  await sendMessage({
    tags: getTags({
      Action: 'Save-Token-Settings',
      Id: id
    }),
    data: JSON.stringify(repoToken)
  })

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Get-Repo-Token-Details', Id: id }),
    Owner: address
  })

  const repoTokenDetails = JSON.parse(Messages[0].Data)?.result as RepoToken

  return repoTokenDetails
}

export const handleSaveRepoBondingCurve = async (id: string, bondingCurve: BondingCurve, address: string) => {
  await sendMessage({
    tags: getTags({
      Action: 'Save-Bonding-Curve-Settings',
      Id: id
    }),
    data: JSON.stringify(bondingCurve)
  })

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Get-Repo-Bonding-Curve-Details', Id: id }),
    Owner: address
  })

  const repoBondingCurveDetails = JSON.parse(Messages[0].Data)?.result as BondingCurve

  return repoBondingCurveDetails
}

export const handleSaveBondingCurveId = async (id: string, bondingCurveId: string) => {
  const msgId = await sendMessage({
    tags: getTags({
      Action: 'Save-Repo-Bonding-Curve-Id',
      Id: id,
      'Bonding-Curve-Id': bondingCurveId
    }),
    pid: AOS_PROCESS_ID
  })

  await pollForTxBeingAvailable({ txId: msgId })

  const { Messages } = await result({
    message: msgId,
    process: AOS_PROCESS_ID
  })

  if (!Messages[0]) {
    throw new Error('Failed to save bonding curve id')
  }

  const action = Messages[0].Tags.find(
    (tag: Tag) => tag.name === 'Action' && tag.value === 'Repo-Bonding-Curve-Id-Updated'
  )

  if (!action) {
    throw new Error('Failed to save bonding curve id')
  }
}

export const handleSaveLiquidityPoolId = async (id: string, liquidityPoolId: string) => {
  const msgId = await sendMessage({
    tags: getTags({
      Action: 'Save-Repo-Liquidity-Pool-Id',
      Id: id,
      'Liquidity-Pool-Id': liquidityPoolId
    }),
    pid: AOS_PROCESS_ID
  })

  await pollForTxBeingAvailable({ txId: msgId })

  const { Messages } = await result({
    message: msgId,
    process: AOS_PROCESS_ID
  })

  if (!Messages[0]) {
    throw new Error('Failed to save liquidity pool id')
  }

  const action = Messages[0].Tags.find(
    (tag: Tag) => tag.name === 'Action' && tag.value === 'Repo-Token-Liquidity-Pool-Id-Updated'
  )

  if (!action) {
    throw new Error('Failed to save liquidity pool id')
  }
}

export const fetchRepoHierarchy = async (id: string) => {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Get-Repo-Hierarchy', Id: id })
  })

  return JSON.parse(Messages[0].Data)
}
