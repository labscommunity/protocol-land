import React from 'react'

import { withAsync } from '@/helpers/withAsync'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { getOidFromRef, readFilesFromOid } from '@/lib/git/helpers/oid'

export default function useRepository(name: string) {
  const [currentOid, setCurrentOid] = React.useState('')
  const [fileObjects, setFileObjects] = React.useState<any>([])
  const [loadRepoStatus, setLoadRepoStatus] = React.useState<ApiStatus>('IDLE')

  const rootOid = React.useRef('')
  const parentsOidList = React.useRef<string[]>([])

  React.useEffect(() => {
    if (!currentOid && name) {
      readRef()
    }
    if (currentOid) {
      fetchFilesFromOid(currentOid)
    }
  }, [currentOid])

  async function readRef() {
    const fs = fsWithName(name)
    const dir = `/${name}`

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
    const fs = fsWithName(name)

    if (loadRepoStatus !== 'PENDING') setLoadRepoStatus('PENDING')

    const { error, response } = await withAsync(() => readFilesFromOid({ dir: '/test-repo', oid, prefix: '', fs }))

    if (error) {
      setLoadRepoStatus('ERROR')
    } else if (response) {
      setFileObjects(response.objects)

      setLoadRepoStatus('SUCCESS')
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

  return {
    fileObjects,
    currentOid,
    rootOid: rootOid.current,
    loadRepoStatus,
    setCurrentOid,
    goBack,
    pushParentOid
  }
}
