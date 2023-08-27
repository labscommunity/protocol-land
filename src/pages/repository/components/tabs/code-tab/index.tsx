import React from 'react'
import { FiCode } from 'react-icons/fi'

import useCommit from '@/pages/repository/hooks/useCommit'
import useRepository from '@/pages/repository/hooks/useRepository'

import Header from './header/Header'
import RepoError from './RepoError'
import RepoLoading from './RepoLoading'
import Row from './Row'
import TableHead from './TableHead'

type Props = {
  repoName: string
}

export default function CodeTab({ repoName = '' }: Props) {
  const { fileObjects, currentOid, rootOid, loadRepoStatus, pushParentOid, setCurrentOid, goBack, initRepoLoading } =
    useRepository(repoName)
  const { commitsList, fetchFirstCommit } = useCommit()

  React.useEffect(() => {
    if (repoName.length > 0) {
      initRepoLoading()
      fetchFirstCommit(repoName)
    }
  }, [repoName])

  function handleFolderClick(fileObject: any) {
    if (fileObject.oid !== currentOid) {
      pushParentOid(currentOid)
    }

    setCurrentOid(fileObject.oid)
  }

  if (loadRepoStatus === 'PENDING') {
    return <RepoLoading />
  }

  if (loadRepoStatus === 'ERROR') {
    return <RepoError />
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <Header />
      <div className="flex w-full">
        <div className="border-liberty-light-200 border-[1.5px] w-full rounded-lg bg-[whitesmoke] text-liberty-dark-100 overflow-hidden">
          <TableHead commit={commitsList[0]} />
          {!fileObjects.length && (
            <div className="py-6 flex gap-2 justify-center items-center">
              <FiCode className="w-8 h-8 text-liberty-dark-100" />
              <h1 className="text-lg text-liberty-dark-100">Get started by adding some files</h1>
            </div>
          )}
          {rootOid !== currentOid && (
            <div
              onClick={goBack}
              className="flex cursor-pointer hover:bg-liberty-light-300 items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-600"
            >
              <span>...</span>
            </div>
          )}
          {fileObjects.map((file: any) => (
            <Row onClick={handleFolderClick} item={file} isFolder={file.type === 'folder'} />
          ))}
        </div>
      </div>
    </div>
  )
}
