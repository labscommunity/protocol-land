import { useState } from 'react'
import { InjectedArweaveSigner } from 'warp-contracts-plugin-signature'

import { CONTRACT_TX_ID } from '@/helpers/constants'
import getWarpContract from '@/helpers/getWrapContract'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'

type Props = {
  txId: string
  initialFetchStatus?: ApiStatus
}

export function useFetchRepository({ txId, initialFetchStatus = 'IDLE' }: Props) {
  const [repo] = useGlobalStore((state) => [state.getUserRepositoryByTxId(txId)])
  const [fetchedRepo, setFetchedRepo] = useState(repo)

  const [fetchRepoStatus, setFetchRepoStatus] = useState<ApiStatus>(() => (repo ? 'SUCCESS' : initialFetchStatus))

  const initFetchRepo = async () => {
    const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
    await userSigner.setPublicKey()

    const contract = getWarpContract(CONTRACT_TX_ID, 'use_wallet')

    if (fetchRepoStatus !== 'PENDING') setFetchRepoStatus('PENDING')
    const { response, error } = await withAsync(() =>
      contract.viewState({
        function: 'getRepository',
        payload: {
          txId: txId
        }
      })
    )

    if (error) {
      setFetchRepoStatus('ERROR')
    } else if (response) {
      setFetchedRepo(response.result)
      setFetchRepoStatus('SUCCESS')
    }
  }

  return {
    fetchedRepo,
    fetchRepoStatus,
    initFetchRepo
  }
}
