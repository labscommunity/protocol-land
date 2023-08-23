import React from 'react'

import { waitFor } from '@/helpers/waitFor'
import { withAsync } from '@/helpers/withAsync'
import { importRepoFromBlob, unmountRepoFromBrowser } from '@/lib/git'

export default function useFetchRepository() {
  const [fetchRepoStatus, setFetchRepoStatus] = React.useState<ApiStatus>('IDLE')

  const initFetchRepo = async (name: string, dataTxId: string) => {
    if (fetchRepoStatus !== 'PENDING') setFetchRepoStatus('PENDING')

    await unmountRepo(name)

    const { response, error } = await withAsync(() => fetch(`https://arweave.net/${dataTxId}`))

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
