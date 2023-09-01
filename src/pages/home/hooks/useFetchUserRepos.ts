import { useState } from 'react'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'

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

    const contract = getWarpContract(CONTRACT_TX_ID, 'use_wallet')

    setFetchUserReposStatus('PENDING')
    const { response, error } = await withAsync(() =>
      contract.viewState({
        function: 'getRepositoriesByOwner',
        payload: {
          owner: address
        }
      })
    )

    if (error) {
      setFetchUserReposStatus('ERROR')
    } else if (response) {
      setUserRepos(response.result)
      setFetchUserReposStatus('SUCCESS')
    }
  }

  return {
    userRepos,
    fetchUserReposStatus,
    initFetchUserRepos
  }
}
