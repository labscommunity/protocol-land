import { useState } from 'react'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID, PL_REPO_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'
import { getRepositoryMetaFromContract } from '@/stores/repository-core/actions'

export function useFetchUserRepos() {
  const [address, userRepos, setUserRepos] = useGlobalStore((state) => [
    state.authState.address,
    state.userState.userRepos,
    state.userActions.setUserRepositories
  ])
  const [fetchUserReposStatus, setFetchUserReposStatus] = useState<ApiStatus>('IDLE')

  const initFetchUserRepos = async () => {
    const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
    await userSigner.setPublicKey()

    const contract = getWarpContract(CONTRACT_TX_ID)

    setFetchUserReposStatus('PENDING')
    const { response: ownerReposResponse, error: ownerReposError } = await withAsync(() =>
      contract.viewState({
        function: 'getRepositoriesByOwner',
        payload: {
          owner: address
        }
      })
    )

    const { response: PLRepoResponse } = await withAsync(() => getRepositoryMetaFromContract(PL_REPO_ID))

    const { response: collabResponse, error: collabError } = await withAsync(() =>
      contract.viewState({
        function: 'getRepositoriesByContributor',
        payload: {
          contributor: address
        }
      })
    )

    if (ownerReposError || collabError) {
      setFetchUserReposStatus('ERROR')
    } else if (ownerReposResponse && collabResponse) {
      const PLRepo = PLRepoResponse?.result ? [PLRepoResponse.result] : []

      setUserRepos([...PLRepo, ...ownerReposResponse.result, ...collabResponse.result])
      setFetchUserReposStatus('SUCCESS')
    }
  }

  return {
    userRepos,
    fetchUserReposStatus,
    initFetchUserRepos
  }
}
