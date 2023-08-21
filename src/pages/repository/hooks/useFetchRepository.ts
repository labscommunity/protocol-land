import React from 'react'

import { waitFor } from '@/helpers/waitFor'
import { withAsync } from '@/helpers/withAsync'
import { importRepoFromBlob, unmountRepoFromBrowser } from '@/lib/git'

type Props = {
  txId: string
  initialFetchStatus?: ApiStatus
}

export default function useFetchRepository({ txId, initialFetchStatus = 'IDLE' }: Props) {
  const [fetchRepoStatus, setFetchRepoStatus] = React.useState<ApiStatus>(initialFetchStatus)

  const initFetchRepo = async (name: string) => {
    if (fetchRepoStatus !== 'PENDING') setFetchRepoStatus('PENDING')

    await unmountRepo(name)

    const { response, error } = await withAsync(() => fetch(`https://arweave.net/${txId}`))

    if (error) {
      setFetchRepoStatus('ERROR')
    } else if (response) {
      const repoArrayBuf = await response.arrayBuffer()
      const success = await importRepoFromBlob(new Blob([repoArrayBuf]))

      await waitFor(1000)
      
      if (!success) {
        setFetchRepoStatus('ERROR')
      } else {
        setFetchRepoStatus('SUCCESS')
      }
    }
  }

  const unmountRepo = async (name: string) => {
    await unmountRepoFromBrowser(name)
  }

  return {
    initFetchRepo,
    unmountRepo,
    fetchRepoStatus
  }
}
