import { langs } from '@uiw/codemirror-extensions-langs'
import { githubLight } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import React from 'react'
import { FiArrowLeft, FiCode, FiEdit3 } from 'react-icons/fi'

import { Button } from '@/components/common/buttons'
import useCommit from '@/pages/repository/hooks/useCommit'
import { useGlobalStore } from '@/stores/globalStore'

import Header from './header/Header'
import RepoError from './RepoError'
import RepoLoading from './RepoLoading'
import Row from './Row'
import TableHead from './TableHead'

type Props = {
  repoName: string
}

export default function CodeTab({ repoName = '' }: Props) {
  const [git, loadFilesFromRepo, gitActions] = useGlobalStore((state) => [
    state.repoCoreState.git,
    state.repoCoreActions.loadFilesFromRepo,
    state.repoCoreActions.git
  ])
  const [fileContent, setFileContent] = React.useState('')

  const { commitsList, fetchFirstCommit } = useCommit()

  React.useEffect(() => {
    loadFilesFromRepo()
    fetchFirstCommit(repoName)
  }, [])

  React.useEffect(() => {
    if (git.currentOid) {
      gitActions.readFilesFromOid(git.currentOid)
    }
  }, [git.currentOid])

  function handleFolderClick(fileObject: any) {
    if (fileObject.oid !== git.currentOid) {
      gitActions.pushParentOid(git.currentOid)
    }

    gitActions.setCurrentOid(fileObject.oid)
  }

  async function handleFileClick(fileObject: any) {
    if (fileObject.oid) {
      const blob = await gitActions.readFileContentFromOid(fileObject.oid)

      if (blob) setFileContent(Buffer.from(blob).toString('utf8'))
    }
  }

  function onGoBackClick() {
    setFileContent('')
  }

  if (git.status === 'PENDING') {
    return <RepoLoading />
  }

  if (git.status === 'ERROR') {
    return <RepoError />
  }

  if (git.status === 'SUCCESS' && fileContent.length > 0) {
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
          {!git.fileObjects.length && (
            <div className="py-6 flex gap-2 justify-center items-center">
              <FiCode className="w-8 h-8 text-liberty-dark-100" />
              <h1 className="text-lg text-liberty-dark-100">Get started by adding some files</h1>
            </div>
          )}
          {git.rootOid !== git.currentOid && (
            <div
              onClick={gitActions.goBack}
              className="flex cursor-pointer hover:bg-liberty-light-300 items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-600"
            >
              <span>...</span>
            </div>
          )}
          {git.fileObjects.map((file: any) => (
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
