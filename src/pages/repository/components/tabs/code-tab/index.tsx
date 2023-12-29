import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { langs } from '@uiw/codemirror-extensions-langs'
import { githubLight } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import clsx from 'clsx'
import mime from 'mime'
import React from 'react'
import CodeMirrorMerge from 'react-codemirror-merge'
import { FileWithPath } from 'react-dropzone'
import { FiArrowLeft, FiCode } from 'react-icons/fi'
import { MdOutlineEdit } from 'react-icons/md'

import { Button } from '@/components/common/buttons'
import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { getFileContent, isImage } from '@/pages/repository/helpers/filenameHelper'
import useCommit from '@/pages/repository/hooks/useCommit'
import { useGlobalStore } from '@/stores/globalStore'

import CommitFilesModal from './CommitFilesModal'
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
  const [isCommitModalOpen, setIsCommitModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [isPreviewMode, setIsPreviewMode] = React.useState(false)
  const [isFileCommited, setIsFileCommitted] = React.useState(false)
  const [fileContent, setFileContent] = React.useState({ original: '', modified: '' })
  const [filename, setFilename] = React.useState('')
  const [filePath, setFilePath] = React.useState('')
  const [files, setFiles] = React.useState<FileWithPath[]>([])

  const { repoCommitsG, fetchFirstCommit } = useCommit()

  React.useEffect(() => {
    if (git.fileObjects.length > 0) return

    loadFilesFromRepo()
  }, [])

  React.useEffect(() => {
    if (repoCommitsG.length > 0 && currentBranch === git.commitSourceBranch) return

    fetchFirstCommit(id)
  }, [currentBranch])

  React.useEffect(() => {
    if (isFileCommited) {
      setFileContent({ original: fileContent.modified, modified: fileContent.modified })
      setIsEditMode(false)
      setIsPreviewMode(false)
    }
  }, [isFileCommited])

  function getFullFilePath(prefix: string, path: string) {
    return '/' + (prefix + '/' + path).split('/').filter(Boolean).join('/')
  }

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
    setFilePath(getFullFilePath(fileObject.prefix, fileObject.path))
  }

  function onGoBackClick() {
    setFileContent({ original: '', modified: '' })
    setFilename('')
    setIsEditMode(false)
    setIsPreviewMode(false)
    setIsSubmitting(false)
    setIsFileCommitted(false)
  }

  async function handleCommitChangesClick() {
    const mimeType = mime.getType(filePath) ?? 'text/plain'
    const blob = new Blob([fileContent.modified], { type: mimeType })
    const file = new File([blob], filename, { type: mimeType })
    Object.defineProperty(file, 'path', { value: filePath })
    setFiles([file])
    setIsCommitModalOpen(true)
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

  if (git.status === 'SUCCESS' && filename) {
    trackGoogleAnalyticsEvent('Repository', 'Load a repo', 'Successfully loaded a repo', {
      repo_id: id,
      repo_name: repoName
    })

    const contributor = isContributor()

    return (
      <div className="flex flex-col gap-2 w-full h-full">
        <div className="flex w-full justify-between h-10">
          <Button onClick={onGoBackClick} className="gap-2 font-medium" variant="primary-outline">
            <FiArrowLeft className="w-5 h-5 text-[inherit]" /> Go back
          </Button>
          {contributor && isEditMode && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setFileContent({ original: fileContent.original, modified: fileContent.original })
                  setIsEditMode(false)
                  setIsPreviewMode(false)
                }}
                variant="primary-outline"
              >
                Cancel changes
              </Button>
              <Button
                isLoading={isSubmitting}
                onClick={handleCommitChangesClick}
                variant="primary-solid"
                disabled={fileContent.original === fileContent.modified || isSubmitting}
              >
                Commit changes
              </Button>
              <CommitFilesModal
                setIsCommited={setIsFileCommitted}
                setIsOpen={setIsCommitModalOpen}
                isOpen={isCommitModalOpen}
                files={files}
              />
            </div>
          )}
        </div>
        <div className="flex w-full h-full mb-4">
          <div className="w-full flex flex-col border-gray-300 border-[1px] rounded-lg bg-white overflow-hidden">
            <div className="rounded-t-lg flex justify-between bg-gray-200 border-b-[1px] border-gray-300 items-center gap-2 py-2 px-4 text-gray-900 font-medium h-10">
              <span className="order-2">{filename}</span>
              {isEditMode ? (
                <div className="flex gap-1 h-7 order-1">
                  <Button
                    onClick={() => setIsPreviewMode(false)}
                    className={clsx(isPreviewMode && '!bg-[#E0E0E0] !border-0')}
                    variant="primary-outline"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => setIsPreviewMode(true)}
                    className={clsx(!isPreviewMode && '!bg-[#E0E0E0] !border-0')}
                    variant="primary-outline"
                  >
                    Preview
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditMode(true)}
                  className="has-tooltip order-2 border border-gray-400 p-1 rounded-md cursor-pointer hover:bg-primary-200"
                >
                  <div className="tooltip rounded shadow-lg p-1 px-2 bg-gray-200 text-black text-sm -mt-12 -ml-16">
                    Edit this file
                    <div className="absolute top-[100%] right-[20%] border-l-[5px] border-r-[5px] border-t-[5px] border-t-gray-700"></div>
                  </div>
                  <MdOutlineEdit className="h-4 w-4" />
                </div>
              )}
            </div>
            {isImage(filename) ? (
              <div className="h-full w-full bg-white flex items-center justify-center p-8">
                <img
                  src={fileContent.original}
                  alt="Image"
                  className="border border-gray-300 border-solid bg-[url('bg.gif')]"
                />
              </div>
            ) : isPreviewMode ? (
              <CodeMirrorMerge orientation="a-b" theme={githubLight}>
                <CodeMirrorMerge.Original
                  extensions={[
                    langs.javascript({ jsx: true }),
                    EditorView.editable.of(false),
                    EditorState.readOnly.of(true)
                  ]}
                  value={fileContent.original}
                />
                <CodeMirrorMerge.Modified
                  extensions={[
                    langs.javascript({ jsx: true }),
                    EditorView.editable.of(false),
                    EditorState.readOnly.of(true)
                  ]}
                  value={fileContent.modified}
                />
              </CodeMirrorMerge>
            ) : (
              <CodeMirror
                className="min-h-[100%] w-full"
                value={isEditMode ? fileContent.modified : fileContent.original}
                minHeight="200px"
                height="100%"
                theme={githubLight}
                extensions={[langs.javascript({ jsx: true })]}
                onChange={(value) => setFileContent((content) => ({ ...content, modified: value }))}
                editable={isEditMode}
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
