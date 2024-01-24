import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { githubLight } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import MDEditor from '@uiw/react-md-editor'
import clsx from 'clsx'
import mime from 'mime'
import React from 'react'
import CodeMirrorMerge from 'react-codemirror-merge'
import { FileWithPath } from 'react-dropzone'
import { FiArrowLeft } from 'react-icons/fi'
import { MdOutlineEdit } from 'react-icons/md'
import Sticky from 'react-stickynode'

import { Button } from '@/components/common/buttons'
import { isImage, isMarkdown } from '@/pages/repository/helpers/filenameHelper'
import useLanguage from '@/pages/repository/hooks/useLanguage'
import { useGlobalStore } from '@/stores/globalStore'

import CommitFilesModal from './CommitFilesModal'

interface FileViewProps {
  fileContent: { original: string; modified: string }
  setFileContent: React.Dispatch<React.SetStateAction<{ original: string; modified: string }>>
  filename: string
  setFilename: React.Dispatch<React.SetStateAction<string>>
  filePath: string
}

export default function FileView({ fileContent, setFileContent, filename, setFilename, filePath }: FileViewProps) {
  const [reloadFilesOnCurrentFolder, isContributor] = useGlobalStore((state) => [
    state.repoCoreActions.reloadFilesOnCurrentFolder,
    state.repoCoreActions.isContributor
  ])
  const [isCommitModalOpen, setIsCommitModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [isPreviewMode, setIsPreviewMode] = React.useState(false)
  const [isFileCommited, setIsFileCommitted] = React.useState(false)
  const [isSticky, setIsSticky] = React.useState(false)
  const [files, setFiles] = React.useState<FileWithPath[]>([])
  const { language } = useLanguage(filename)

  const contributor = isContributor()
  const isMarkdownFile = isMarkdown(filename)
  const isImageFile = isImage(filename)

  React.useEffect(() => {
    if (isFileCommited) {
      setFileContent({ original: fileContent.modified, modified: fileContent.modified })
      setIsEditMode(false)
      setIsPreviewMode(false)
      reloadFilesOnCurrentFolder()
    }
  }, [isFileCommited])

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

  const handleStateChange = (status: Sticky.Status) => {
    setIsSticky(status.status === Sticky.STATUS_FIXED)
  }

  return (
    <div className="flex flex-col w-full h-full" id="file-view-editor">
      <Sticky top={0} innerActiveClass="z-20" onStateChange={handleStateChange}>
        <div className={clsx('flex gap-2 flex-col bg-gray-50', isSticky && 'pt-2')}>
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
          <div className="sticky top-12 z-20 rounded-t-lg flex justify-between bg-gray-200 border-[1px] border-gray-300 items-center gap-2 py-2 px-4 text-gray-900 font-medium h-10">
            <span className="order-2">{filename}</span>
            {isEditMode ? (
              <div className="flex items-center p-1 bg-gray-100 border-[1px] border-gray-300 rounded-lg gap-1 h-8 order-1">
                <span
                  onClick={() => setIsPreviewMode(false)}
                  className={clsx('cursor-pointer text-gray-700', {
                    'px-2': isPreviewMode,
                    'px-3 bg-primary-600 text-white rounded-md': !isPreviewMode
                  })}
                >
                  Edit
                </span>
                <span
                  onClick={() => setIsPreviewMode(true)}
                  className={clsx('cursor-pointer text-gray-700', {
                    'px-2': !isPreviewMode,
                    'px-3 bg-primary-600 text-white rounded-md': isPreviewMode
                  })}
                >
                  Preview
                </span>
              </div>
            ) : (
              !isImageFile && (
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
              )
            )}
          </div>
        </div>
      </Sticky>
      <div className="flex w-full h-full mb-4">
        <div className="w-full flex flex-col border-gray-300 border-[1px] rounded-b-lg">
          {isImageFile ? (
            <div className="h-full w-full bg-white flex items-center justify-center p-8 rounded-b-lg overflow-hidden">
              <img
                src={fileContent.original}
                alt="Image"
                className="border border-gray-300 border-solid bg-[url('bg.gif')]"
              />
            </div>
          ) : isPreviewMode ? (
            !isMarkdownFile ? (
              <CodeMirrorMerge orientation="a-b" theme={githubLight} className="rounded-b-lg overflow-hidden">
                <CodeMirrorMerge.Original
                  extensions={[language!, EditorView.editable.of(false), EditorState.readOnly.of(true)]}
                  value={fileContent.original}
                />
                <CodeMirrorMerge.Modified
                  extensions={[language!, EditorView.editable.of(false), EditorState.readOnly.of(true)]}
                  value={fileContent.modified}
                />
              </CodeMirrorMerge>
            ) : (
              <MDEditor.Markdown className="p-8 !min-h-[200px] rounded-b-lg" source={fileContent.modified} />
            )
          ) : !isMarkdownFile ? (
            <CodeMirror
              className="w-full rounded-b-lg overflow-hidden"
              value={isEditMode ? fileContent.modified : fileContent.original}
              minHeight="200px"
              height="100%"
              theme={githubLight}
              placeholder="Enter file contents here"
              extensions={[language!]}
              onChange={(value) => setFileContent((content) => ({ ...content, modified: value }))}
              editable={isEditMode}
            />
          ) : isEditMode ? (
            <MDEditor
              minHeight={200}
              height="100%"
              visibleDragbar={false}
              preview="edit"
              value={fileContent.modified}
              onChange={(value) => setFileContent((content) => ({ ...content, modified: value! }))}
            />
          ) : (
            <MDEditor.Markdown className="p-8 !min-h-[200px] rounded-b-lg" source={fileContent.modified} />
          )}
        </div>
      </div>
    </div>
  )
}
