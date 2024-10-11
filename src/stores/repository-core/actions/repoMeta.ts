import { dryrun, result } from '@permaweb/aoconnect'
import { Tag } from 'arweave/web/lib/transaction'

import { AOS_PROCESS_ID } from '@/helpers/constants'
import { getTags } from '@/helpers/getTags'
import { getRepo, sendMessage } from '@/lib/contract'
import { pollForTxBeingAvailable } from '@/lib/decentralize'
import { useGlobalStore } from '@/stores/globalStore'
import { Repo, RepoLiquidityPool, RepoToken } from '@/types/repository'
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

export const handleSaveRepoLiquidityPool = async (
  id: string,
  repoLiquidityPool: RepoLiquidityPool,
  address: string
) => {
  await sendMessage({
    tags: getTags({
      Action: 'Save-Token-Liquidity-Pool-Settings',
      Id: id
    }),
    data: JSON.stringify(repoLiquidityPool)
  })

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Get-Repo-Token-Liquidity-Pool-Details', Id: id }),
    Owner: address
  })

  const repoLiquidityPoolDetails = JSON.parse(Messages[0].Data)?.result as RepoLiquidityPool

  return repoLiquidityPoolDetails
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

export const handleDisableRepoLiquidityPool = async (id: string) => {
  const msgId = await sendMessage({
    tags: getTags({
      Action: 'Disable-Token-Liquidity-Pool',
      Id: id
    })
  })

  const { Messages } = await result({
    message: msgId,
    process: AOS_PROCESS_ID
  })

  const { Tags } = Messages[0]

  const action = Tags.find((tag: Tag) => tag.name === 'Action' && tag.value === 'Repo-Token-Liquidity-Pool-Disabled')

  if (action) {
    return true
  }

  return false
}

export const fetchRepoHierarchy = async (id: string) => {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Get-Repo-Hierarchy', Id: id })
  })

  return JSON.parse(Messages[0].Data)
}
