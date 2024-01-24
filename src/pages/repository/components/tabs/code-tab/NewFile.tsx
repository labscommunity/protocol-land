import { githubLight } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import MDEditor from '@uiw/react-md-editor'
import clsx from 'clsx'
import mime from 'mime'
import React, { useMemo } from 'react'
import { FileWithPath } from 'react-dropzone'
import toast from 'react-hot-toast'
import { FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import Sticky from 'react-stickynode'

import { Button } from '@/components/common/buttons'
import { rootTabConfig } from '@/pages/repository/config/rootTabConfig'
import { isMarkdown } from '@/pages/repository/helpers/filenameHelper'
import useLanguage from '@/pages/repository/hooks/useLanguage'
import { useGlobalStore } from '@/stores/globalStore'

import CommitFilesModal from './CommitFilesModal'

export default function NewFile() {
  const [fileContent, setFileContent] = React.useState('')
  const [filename, setFilename] = React.useState('')
  const [files, setFiles] = React.useState<FileWithPath[]>([])
  const [isSticky, setIsSticky] = React.useState(false)
  const [isCommitModalOpen, setIsCommitModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isFileCommited, setIsFileCommitted] = React.useState(false)
  const { language } = useLanguage(filename)

  const isMarkdownFile = useMemo(() => isMarkdown(filename), [filename])

  const [
    isContributor,
    git,
    gitActions,
    reloadFilesOnCurrentFolder,
    getCurrentFolderPath,
    currentBranch,
    selectedRepo
  ] = useGlobalStore((state) => [
    state.repoCoreActions.isContributor,
    state.repoCoreState.git,
    state.repoCoreActions.git,
    state.repoCoreActions.reloadFilesOnCurrentFolder,
    state.repoCoreActions.git.getCurrentFolderPath,
    state.branchState.currentBranch,
    state.repoCoreState.selectedRepo.repo
  ])

  const filePath = useMemo(() => joinPaths(getCurrentFolderPath(), filename), [filename])
  const navigate = useNavigate()
  const contributor = isContributor()

  React.useEffect(() => {
    if (isFileCommited) {
      reloadFilesOnCurrentFolder()
      onGoBackClick()
    }
  }, [isFileCommited])

  async function onGoBackClick() {
    setFileContent('')
    setFilename('')
    setIsSubmitting(false)
    setIsFileCommitted(false)
    gitActions.setIsCreateNewFile(false)
  }

  async function handleCommitChangesClick() {
    if (git.fileObjects.findIndex((fileObject) => fileObject.path === filename) > -1) {
      toast.error(`File ${filename} already exists in the same directory`)
      return
    }
    const mimeType = mime.getType(filePath) ?? 'text/plain'
    const blob = new Blob([fileContent], { type: mimeType })
    const file = new File([blob], filename, { type: mimeType })
    Object.defineProperty(file, 'path', { value: filePath })
    setFiles([file])
    setIsCommitModalOpen(true)
  }

  function getBasePath() {
    const prefix = getCurrentFolderPath()
    return prefix ? `${prefix}/` : ''
  }

  function joinPaths(...paths: string[]) {
    return '/' + paths.join('/').split('/').filter(Boolean).join('/')
  }

  function gotoBranch() {
    if (selectedRepo) {
      navigate(rootTabConfig[0].getPath(selectedRepo?.id, currentBranch))
    }
  }

  const handleStateChange = (status: Sticky.Status) => {
    setIsSticky(status.status === Sticky.STATUS_FIXED)
  }

  return (
    <div className="flex flex-col w-full h-full" id="new-file-editor">
      <Sticky top={0} innerActiveClass="z-10" onStateChange={handleStateChange}>
        <div className={clsx('flex flex-col gap-3 bg-gray-50', isSticky && 'pt-2')}>
          <div className="flex w-full justify-between h-10">
            <div className="flex gap-3">
              <Button onClick={onGoBackClick} className="gap-2 font-medium" variant="primary-outline">
                <FiArrowLeft className="w-5 h-5 text-[inherit]" /> Go back
              </Button>
              <div className="flex items-center gap-1">
                <span>{getBasePath()}</span>
                <input
                  type="text"
                  placeholder="Name your file..."
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-1 outline-none border-gray-300"
                />
                <span>in</span>{' '}
                <span
                  onClick={gotoBranch}
                  className="bg-primary-200 px-1 rounded-md text-primary-700 hover:underline cursor-pointer"
                >
                  {currentBranch}
                </span>
              </div>
            </div>
            {contributor && (
              <div className="flex gap-2">
                <Button onClick={onGoBackClick} variant="primary-outline">
                  Cancel changes
                </Button>
                <Button
                  isLoading={isSubmitting}
                  onClick={handleCommitChangesClick}
                  variant="primary-solid"
                  disabled={!filename}
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
          <div className="w-full flex flex-col border-gray-300 border-[1px] rounded-lg rounded-b-none border-b-0 bg-white">
            <div className="rounded-t-lg flex justify-between bg-gray-200 border-b-[1px] border-gray-300 items-center gap-2 py-2 px-4 text-gray-900 font-medium h-10">
              <span className={clsx(!filename && 'py-10')}>{filename}</span>
            </div>
          </div>
        </div>
      </Sticky>
      <div className="flex w-full h-full mb-4">
        <div className="w-full flex flex-col border-gray-300 border-[1px] rounded-t-none border-t-0 rounded-lg bg-white">
          {isMarkdownFile ? (
            <MDEditor
              className="!h-full !min-h-[200px]"
              visibleDragbar={false}
              value={fileContent}
              onChange={(value) => setFileContent(value!)}
            />
          ) : (
            <CodeMirror
              className="w-full h-full rounded-b-lg overflow-hidden"
              value={fileContent}
              minHeight="200px"
              height="100%"
              placeholder="Enter file contents here"
              theme={githubLight}
              extensions={[language!]}
              onChange={(value) => setFileContent(value)}
              editable={true}
            />
          )}
        </div>
      </div>
    </div>
  )
}
