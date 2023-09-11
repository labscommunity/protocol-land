import { langs } from '@uiw/codemirror-extensions-langs'
import { githubLight } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import React from 'react'
import { FiArrowLeft, FiCode, FiEdit3 } from 'react-icons/fi'

import { Button } from '@/components/common/buttons'
import { getFileContent, isImage } from '@/pages/repository/helpers/filenameHelper'
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
  const [git, loadFilesFromRepo, gitActions, isContributor] = useGlobalStore((state) => [
    state.repoCoreState.git,
    state.repoCoreActions.loadFilesFromRepo,
    state.repoCoreActions.git,
    state.repoCoreActions.isContributor
  ])
  const [fileContent, setFileContent] = React.useState('')
  const [filename, setFilename] = React.useState('')

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
    if (!fileObject || !fileObject.oid) return

    const blob = await gitActions.readFileContentFromOid(fileObject.oid)

    if (!blob) return

    const fileContent = await getFileContent(blob, fileObject.path)

    if (!fileContent) return

    setFileContent(fileContent)
    setFilename(fileObject.path)
  }

  function onGoBackClick() {
    setFileContent('')
    setFilename('')
  }

  if (git.status === 'PENDING') {
    return <RepoLoading />
  }

  if (git.status === 'ERROR') {
    return <RepoError />
  }

  if (git.status === 'SUCCESS' && fileContent.length > 0) {
    const contributor = isContributor()

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
          {contributor && (
            <div>
              <Button className="flex gap-2 items-center rounded-full font-medium" variant="solid">
                <FiEdit3 className="w-5 h-5 text-[inherit]" />
                Edit
              </Button>
            </div>
          )}
        </div>
        <div className="flex w-full h-full mb-4">
          <div className="w-full flex flex-col pt-[3px]">
            <div className="flex font-medium border-[1.2px] border-b-0 bg-[#5E70AB] px-4 py-2 text-[whitesmoke] rounded-t-lg border-liberty-light-400">
              {filename}
            </div>
            {isImage(filename) ? (
              <div className="min-h-[100%] w-full border-[1.2px] rounded-b-lg overflow-hidden bg-white border-liberty-light-400 flex items-center justify-center">
                <img src={fileContent} alt="Image" />
              </div>
            ) : (
              <CodeMirror
                className="min-h-[100%] w-full border-[1.2px] rounded-b-lg overflow-hidden border-liberty-light-400"
                value={fileContent}
                minHeight="200px"
                height="100%"
                theme={githubLight}
                extensions={[langs.javascript({ jsx: true })]}
                onChange={() => {}}
                editable={false}
              />
            )}
          </div>
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
