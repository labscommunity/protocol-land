import React from 'react'

import { waitFor } from '@/helpers/waitFor'
import { withAsync } from '@/helpers/withAsync'
import { importRepoFromBlob, unmountRepoFromBrowser } from '@/lib/git'
import { fsWithName } from '@/lib/git/helpers/fsWithName'

export default function useFetchRepository() {
  const [fetchRepoStatus, setFetchRepoStatus] = React.useState<ApiStatus>('IDLE')

  const initFetchRepo = async (name: string, dataTxId: string) => {
    if (fetchRepoStatus !== 'PENDING') setFetchRepoStatus('PENDING')

    await unmountRepo(name)

    const { response, error } = await withAsync(() => fetch(`https://arweave.net/${dataTxId}`))

    if (error) {
      setFetchRepoStatus('ERROR')
    } else if (response) {
      const fs = fsWithName(name)
      const dir = `/${name}`

      const repoArrayBuf = await response.arrayBuffer()
      const success = await importRepoFromBlob(fs, dir, new Blob([repoArrayBuf]))

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
