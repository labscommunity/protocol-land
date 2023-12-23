import React from 'react'

import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { withAsync } from '@/helpers/withAsync'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { getOidFromRef, readFileFromOid, readFilesFromOid } from '@/lib/git/helpers/oid'
import { packGitRepo } from '@/lib/git/helpers/zipUtils'

export default function useRepository(id: string, name: string) {
  const [currentOid, setCurrentOid] = React.useState('')
  const [fileObjects, setFileObjects] = React.useState<any>([])
  const [loadRepoStatus, setLoadRepoStatus] = React.useState<ApiStatus>('IDLE')

  const rootOid = React.useRef('')
  const parentsOidList = React.useRef<string[]>([])

  React.useEffect(() => {
    if (currentOid) {
      fetchFilesFromOid(currentOid)
    }
  }, [currentOid])

  async function initRepoLoading() {
    const fs = fsWithName(id)
    const dir = `/${id}`

    setLoadRepoStatus('PENDING')

    const { error, response } = await withAsync(() => getOidFromRef({ ref: 'master', dir, fs }))

    if (error) {
      setLoadRepoStatus('ERROR')
    } else if (response) {
      setCurrentOid(response)
      rootOid.current = response
    }
  }

  async function fetchFilesFromOid(oid: string) {
    const fs = fsWithName(id)
    const dir = `/${id}`

    if (loadRepoStatus !== 'PENDING') setLoadRepoStatus('PENDING')

    const { error, response } = await withAsync(() => readFilesFromOid({ dir, oid, prefix: '', fs }))

    if (error) {
      setLoadRepoStatus('ERROR')
    } else if (response) {
      setFileObjects(response.objects)

      setLoadRepoStatus('SUCCESS')
    }
  }

  async function fetchFileContentFromOid(oid: string) {
    const fs = fsWithName(id)
    const dir = `/${id}`

    if (loadRepoStatus !== 'PENDING') setLoadRepoStatus('PENDING')

    const { error, response } = await withAsync(() => readFileFromOid({ dir, oid, fs }))

    if (error) {
      setLoadRepoStatus('ERROR')
    } else if (response) {
      setLoadRepoStatus('SUCCESS')

      return response
    }
  }

  function pushParentOid(oid: string) {
    parentsOidList.current.push(oid)
  }

  function popParentOid() {
    return parentsOidList.current.pop()
  }

  async function goBack() {
    const lastParentOid = popParentOid()

    if (!lastParentOid) return

    setCurrentOid(lastParentOid)
  }

  async function downloadRepository() {
    const fs = fsWithName(id)
    const dir = `/${id}`

    const blob = await packGitRepo({ fs, dir })

    const downloadLink = document.createElement('a')
    downloadLink.href = URL.createObjectURL(blob)
    downloadLink.download = `${name}.zip` // Set the desired filename for the ZIP file
    downloadLink.style.display = 'none'
    document.body.appendChild(downloadLink)

    // Simulate a click on the download link
    downloadLink.click()

    // Clean up the temporary URL object
    URL.revokeObjectURL(downloadLink.href)

    // Remove the download link from the DOM
    document.body.removeChild(downloadLink)

    trackGoogleAnalyticsEvent('Repository', 'Download a repository', 'Download repository', {
      repo_name: name
    })
  }

  return {
    fileObjects,
    currentOid,
    rootOid: rootOid.current,
    loadRepoStatus,
    setCurrentOid,
    goBack,
    pushParentOid,
    initRepoLoading,
    fetchFileContentFromOid,
    downloadRepository
  }
}
