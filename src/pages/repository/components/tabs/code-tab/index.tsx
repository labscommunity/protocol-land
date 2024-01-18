import React from 'react'
import { FiCode } from 'react-icons/fi'

import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { getFileContent } from '@/pages/repository/helpers/filenameHelper'
import useCommit from '@/pages/repository/hooks/useCommit'
import { useGlobalStore } from '@/stores/globalStore'

import FileView from './FileView'
import Header from './header/Header'
import NewFile from './NewFile'
import Readme from './Readme'
import RepoError from './RepoError'
import RepoLoading from './RepoLoading'
import Row from './Row'
import TableHead from './TableHead'

type Props = {
  repoName: string
  id: string
}

export default function CodeTab({ repoName = '', id = '' }: Props) {
  const [git, loadFilesFromRepo, gitActions, currentBranch] = useGlobalStore((state) => [
    state.repoCoreState.git,
    state.repoCoreActions.loadFilesFromRepo,
    state.repoCoreActions.git,
    state.branchState.currentBranch
  ])
  const readmeFileObject = React.useMemo(
    () => git.fileObjects.find((file) => file.path.toLowerCase() === 'readme.md'),
    [git.currentOid]
  )
  const [fileContent, setFileContent] = React.useState({ original: '', modified: '' })
  const [filename, setFilename] = React.useState('')
  const [filePath, setFilePath] = React.useState('')

  const { repoCommitsG, fetchFirstCommit } = useCommit()

  React.useEffect(() => {
    if (git.fileObjects.length > 0) return

    loadFilesFromRepo()
  }, [])

  React.useEffect(() => {
    if (repoCommitsG.length > 0 && currentBranch === git.commitSourceBranch) return

    fetchFirstCommit(id)
  }, [currentBranch])

  function handleFolderClick(fileObject: any) {
    if (fileObject.oid !== git.currentOid) {
      gitActions.pushParentOid(git.currentOid)
    }

    gitActions.setCurrentOid(fileObject.oid)
    gitActions.readFilesFromOid(fileObject.oid, fileObject.prefix)
  }

  async function handleFileClick(fileObject: any) {
    if (!fileObject || !fileObject.oid) return

    const blob = await gitActions.readFileContentFromOid(fileObject.oid)

    if (!blob) return

    const fileContent = (await getFileContent(blob, fileObject.path)) || ''

    setFileContent({ original: fileContent, modified: fileContent })
    setFilename(fileObject.path)
    setFilePath(`/${fileObject.prefix}`)
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

  if (git.status === 'SUCCESS' && (filename || git.isCreateNewFile)) {
    trackGoogleAnalyticsEvent('Repository', 'Load a repo', 'Successfully loaded a repo', {
      repo_id: id,
      repo_name: repoName
    })

    if (git.isCreateNewFile) {
      return <NewFile />
    }

    return (
      <FileView
        fileContent={fileContent}
        setFileContent={setFileContent}
        filename={filename}
        setFilename={setFilename}
        filePath={filePath}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
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
      <Readme fileObject={readmeFileObject} />
    </div>
  )
}
