import { dryrun } from '@/helpers/aoconnect'
import { AOS_PROCESS_ID } from '@/helpers/constants'
import { getTags } from '@/helpers/getTags'
import { getRepo, sendMessage } from '@/lib/contract'
import { useGlobalStore } from '@/stores/globalStore'
import { Repo } from '@/types/repository'
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
