import React from 'react'

import { withAsync } from '@/helpers/withAsync'
import { importRepoFromBlob, unmountRepoFromBrowser } from '@/lib/git'

type Props = {
  txId: string
  initialFetchStatus?: ApiStatus
}

export default function useFetchRepository({ txId, initialFetchStatus = 'IDLE' }: Props) {
  const [fetchRepoStatus, setFetchRepoStatus] = React.useState<ApiStatus>(initialFetchStatus)

  const initFetchRepo = async () => {
    if (fetchRepoStatus !== 'PENDING') setFetchRepoStatus('PENDING')

    const { response, error } = await withAsync(() =>
      fetch(`https://arweave.net/${txId}`).then((res) => res.arrayBuffer())
    )

    if (error) {
      setFetchRepoStatus('ERROR')
    } else if (response) {
      const success = await importRepoFromBlob(new Blob([response]))

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
