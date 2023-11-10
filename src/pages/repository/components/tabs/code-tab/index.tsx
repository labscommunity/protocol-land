import { langs } from '@uiw/codemirror-extensions-langs'
import { githubLight } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import React from 'react'
import { FiArrowLeft, FiCode, FiEdit3 } from 'react-icons/fi'

import { Button } from '@/components/common/buttons'
import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
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
  id: string
}

export default function CodeTab({ repoName = '', id = '' }: Props) {
  const [git, loadFilesFromRepo, gitActions, isContributor, currentBranch] = useGlobalStore((state) => [
    state.repoCoreState.git,
    state.repoCoreActions.loadFilesFromRepo,
    state.repoCoreActions.git,
    state.repoCoreActions.isContributor,
    state.branchState.currentBranch
  ])
  const [fileContent, setFileContent] = React.useState('')
  const [filename, setFilename] = React.useState('')

  const { repoCommitsG, fetchFirstCommit } = useCommit()

  React.useEffect(() => {
    if (git.fileObjects.length > 0) return

    loadFilesFromRepo()
  }, [])

  React.useEffect(() => {
    if (repoCommitsG.length > 0 && currentBranch === git.commitSourceBranch) return

    fetchFirstCommit(repoName)
  }, [currentBranch])

  // React.useEffect(() => {
  //   if (git.currentOid) {
  //     gitActions.readFilesFromOid(git.currentOid)
  //   }
  // }, [git.currentOid])

  function handleFolderClick(fileObject: any) {
    if (fileObject.oid !== git.currentOid) {
      gitActions.pushParentOid(git.currentOid)
    }

    gitActions.setCurrentOid(fileObject.oid)
    gitActions.readFilesFromOid(fileObject.oid)
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
    trackGoogleAnalyticsEvent('Repository', 'Load a repo', 'Failed to load repo', {
      repo_id: id,
      repo_name: repoName
    })

    return <RepoError />
  }

  if (git.status === 'SUCCESS' && fileContent.length > 0) {
    trackGoogleAnalyticsEvent('Repository', 'Load a repo', 'Successfully loaded a repo', {
      repo_id: id,
      repo_name: repoName
    })

    const contributor = isContributor()

    return (
      <div className="flex flex-col gap-2 w-full h-full">
        <div className="flex w-full justify-between">
          <Button onClick={onGoBackClick} className="gap-2 font-medium" variant="primary-outline">
            <FiArrowLeft className="w-5 h-5 text-[inherit]" /> Go back
          </Button>
          {contributor && (
            <div>
              <Button className="gap-2 font-medium" variant="primary-solid">
                <FiEdit3 className="w-5 h-5 text-[inherit]" />
                Edit
              </Button>
            </div>
          )}
        </div>
        <div className="flex w-full h-full mb-4">
          <div className="w-full flex flex-col border-gray-300 border-[1px] rounded-lg bg-white overflow-hidden">
            <div className="rounded-t-lg flex justify-between bg-gray-200 border-b-[1px] border-gray-300 items-center gap-2 py-2 px-4 text-gray-900 font-medium">
              {filename}
            </div>
            {isImage(filename) ? (
              <div className="min-h-[100%] w-full overflow-hidden bg-white flex items-center justify-center">
                <img src={fileContent} alt="Image" />
              </div>
            ) : (
              <CodeMirror
                className="min-h-[100%] w-full"
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
    <div className="flex flex-col gap-6 w-full">
      <Header />
      <div className="flex w-full">
        <div className="border-gray-300 border-[1px] w-full rounded-lg bg-white overflow-hidden">
          <TableHead commit={repoCommitsG[0]} />
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
