import { createDataItemSigner, dryrun, message, result } from '@permaweb/aoconnect'

import { AOS_PROCESS_ID } from '@/helpers/constants'
import { extractMessage } from '@/helpers/extractMessage'
import { getTags } from '@/helpers/getTags'
import { getSigner } from '@/helpers/wallet/getSigner'
import { useGlobalStore } from '@/stores/globalStore'
import { Repo } from '@/types/repository'
// Repo Meta

export const getRepositoryMetaFromContract = async (id: string): Promise<{ result: Repo }> => {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: id
    })
  })

  return JSON.parse(Messages[0].Data)
}

export const isRepositoryNameAvailable = async (name: string): Promise<boolean> => {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository-Availability',
      Name: name
    }),
    Owner: useGlobalStore.getState().authState.address as string
  })

  console.log(Messages)

  return JSON.parse(Messages[0].Data).result
}

export const searchRepositories = async (query: string): Promise<{ result: Repo[] }> => {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Get-Repositories-By-Name', Query: query })
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
    tags.PrivateStateTxId = privateStateTxId
  }

  if (ghSyncPrivateStateTxId) {
    tags.GhSyncPrivateStateTxId = ghSyncPrivateStateTxId
  }

  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags(tags),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: id
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

  return { contributorInvites: repo.contributorInvites, contributors: repo.contributors, githubSync: repo.githubSync }
}

export const handleRejectContributor = async (id: string) => {
  //rotate keys
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Reject-Contributor-Invite',
      Id: id
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: id
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

  return { contributorInvites: repo.contributorInvites, contributors: repo.contributors }
}

export const handleCancelContributorInvite = async (id: string, contributor: string) => {
  //rotate keys
  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Cancel-Contributor-Invite',
      Id: id,
      Contributor: contributor
    }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({
      Action: 'Get-Repository',
      Id: id
    })
  })

  const repo = JSON.parse(Messages[0].Data)?.result as Repo

  return repo.contributorInvites
}
