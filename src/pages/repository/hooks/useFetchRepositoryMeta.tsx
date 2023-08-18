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

export function useFetchRepositoryMeta({ txId, initialFetchStatus = 'IDLE' }: Props) {
  const [repoMeta] = useGlobalStore((state) => [state.getUserRepositoryMetaByTxId(txId)])
  const [fetchedRepoMeta, setFetchedRepoMeta] = useState(repoMeta)

  const [fetchRepoMetaStatus, setFetchRepoMetaStatus] = useState<ApiStatus>(() =>
    repoMeta ? 'SUCCESS' : initialFetchStatus
  )

  const initFetchRepoMeta = async () => {
    const userSigner = new InjectedArweaveSigner(window.arweaveWallet)
    await userSigner.setPublicKey()

    const contract = getWarpContract(CONTRACT_TX_ID, 'use_wallet')

    if (fetchRepoMetaStatus !== 'PENDING') setFetchRepoMetaStatus('PENDING')
    const { response, error } = await withAsync(() =>
      contract.viewState({
        function: 'getRepository',
        payload: {
          txId: txId
        }
      })
    )

    if (error) {
      setFetchRepoMetaStatus('ERROR')
    } else if (response) {
      setFetchedRepoMeta(response.result)
      setFetchRepoMetaStatus('SUCCESS')
    }
  }

  return {
    fetchedRepoMeta,
    fetchRepoMetaStatus,
    initFetchRepoMeta
  }
}
