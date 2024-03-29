import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { getSigner } from '@/helpers/wallet/getSigner'
import { Repo, WarpReadState } from '@/types/repository'
// Repo Meta

export const getRepositoryMetaFromContract = async (id: string): Promise<{ result: Repo }> => {
  const contract = await getWarpContract(CONTRACT_TX_ID)

  return contract.viewState({
    function: 'getRepository',
    payload: {
      id
    }
  })
}

export const isRepositoryNameAvailable = async (name: string, caller: string): Promise<boolean> => {
  const contract = await getWarpContract(CONTRACT_TX_ID)

  const { result: isAvailable } = await contract.viewState(
    {
      function: 'isRepositoryNameAvailable',
      payload: { name }
    },
    undefined,
    undefined,
    caller
  )

  return isAvailable
}

export const searchRepositories = async (query: string): Promise<{ result: Repo[] }> => {
  const contract = await getWarpContract(CONTRACT_TX_ID)

  const {
    cachedValue: {
      state: { repos }
    }
  }: WarpReadState = await contract.readState()

  const repoList = Object.values(repos)
  const ownerRepos = repoList.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))

  return { result: ownerRepos }
}

export const handleAcceptContributor = async (
  id: string,
  visibility: string,
  privateStateTxId: string | null,
  ghSyncPrivateStateTxId: string | null
) => {
  //rotate keys
  const userSigner = await getSigner()

  const contract = await getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'acceptContributorInvite',
    payload: { id, visibility, privateStateTxId, ghSyncPrivateStateTxId }
  })

  const {
    cachedValue: {
      state: { repos }
    }
  } = await contract.readState()

  const repo = repos[id] as Repo

  return { contributorInvites: repo.contributorInvites, contributors: repo.contributors, githubSync: repo.githubSync }
}

export const handleRejectContributor = async (id: string) => {
  //rotate keys
  const userSigner = await getSigner()

  const contract = await getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'rejectContributorInvite',
    payload: { id }
  })

  const {
    cachedValue: {
      state: { repos }
    }
  } = await contract.readState()

  const repo = repos[id] as Repo

  return { contributorInvites: repo.contributorInvites, contributors: repo.contributors }
}

export const handleCancelContributorInvite = async (id: string, contributor: string) => {
  //rotate keys
  const userSigner = await getSigner()

  const contract = await getWarpContract(CONTRACT_TX_ID, userSigner)

  await contract.writeInteraction({
    function: 'cancelContributorInvite',
    payload: { id, contributor }
  })

  const {
    cachedValue: {
      state: { repos }
    }
  } = await contract.readState()

  const repo = repos[id] as Repo

  return repo.contributorInvites
}
