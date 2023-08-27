import { langs } from '@uiw/codemirror-extensions-langs'
import { githubLight } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import React from 'react'
import { FiArrowLeft, FiCode, FiEdit3 } from 'react-icons/fi'

import { Button } from '@/components/common/buttons'
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
  const [fileContent, setFileContent] = React.useState('')
  const {
    fileObjects,
    currentOid,
    rootOid,
    loadRepoStatus,
    pushParentOid,
    setCurrentOid,
    goBack,
    initRepoLoading,
    fetchFileContentFromOid
  } = useRepository(repoName)
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

  async function handleFileClick(fileObject: any) {
    if (fileObject.oid) {
      const blob = await fetchFileContentFromOid(fileObject.oid)

      if (blob) setFileContent(Buffer.from(blob).toString('utf8'))
    }
  }

  function onGoBackClick() {
    setFileContent('')
  }

  if (loadRepoStatus === 'PENDING') {
    return <RepoLoading />
  }

  if (loadRepoStatus === 'ERROR') {
    return <RepoError />
  }

  if (loadRepoStatus === 'SUCCESS' && fileContent.length > 0) {
    return (
      <div className="flex flex-col gap-2 w-full h-full">
        <div className="flex w-full justify-between">
          <Button
            onClick={onGoBackClick}
            className="flex gap-2 items-center rounded-full font-medium h-[40px]"
            variant="outline"
          >
            <FiArrowLeft className="w-5 h-5 text-[inherit]" /> Go back
          </Button>
          <div>
            <Button className="flex gap-2 items-center rounded-full font-medium" variant="solid">
              <FiEdit3 className="w-5 h-5 text-[inherit]" />
              Edit
            </Button>
          </div>
        </div>
        <div className="flex w-full h-full mb-4">
          <CodeMirror
            className="min-h-[100%] w-full border-[1.2px] rounded-md overflow-hidden border-liberty-light-400"
            value={fileContent}
            minHeight="200px"
            height="100%"
            theme={githubLight}
            extensions={[langs.javascript({ jsx: true })]}
            onChange={() => {}}
            editable={false}
          />
        </div>
      </div>
    )
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
            <Row
              onFolderClick={handleFolderClick}
              onFileClick={handleFileClick}
              item={file}
              isFolder={file.type === 'folder'}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
