import MDEditor from '@uiw/react-md-editor'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { LiaReadme } from 'react-icons/lia'
import Sticky from 'react-stickynode'

import { getFileContent } from '@/pages/repository/helpers/filenameHelper'
import { useGlobalStore } from '@/stores/globalStore'
import { FileObject } from '@/stores/repository-core/types'

export default function Readme({ fileObject }: { fileObject?: FileObject }) {
  const [fileContent, setFileContent] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [gitActions] = useGlobalStore((state) => [state.repoCoreActions.git])
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    loadReadmeContent()
  }, [fileObject])

  async function loadReadmeContent() {
    setIsLoading(true)
    if (!fileObject || !fileObject.oid) {
      setIsLoading(false)
      return
    }

    const blob = await gitActions.readFileContentFromOid(fileObject.oid)

    if (!blob) return

    const fileContent = (await getFileContent(blob, fileObject.path)) || ''

    setFileContent(fileContent)
    setIsLoading(false)
  }

  const handleStateChange = (status: Sticky.Status) => {
    setIsSticky(status.status === Sticky.STATUS_FIXED)
  }

  if (!fileObject) return null

  return (
    <div className="border border-gray-300 rounded-lg">
      <Sticky top={0} innerActiveClass="z-10" onStateChange={handleStateChange}>
        <div
          className={clsx(
            'z-10 h-[41px] flex items-center gap-2 bg-gray-200 border-gray-300 border-b px-4',
            !isSticky && 'rounded-t-lg'
          )}
        >
          <LiaReadme className="w-5 h-5" />
          <div className="font-medium">README</div>
        </div>
      </Sticky>
      <MDEditor.Markdown className="p-8 !min-h-[200px] rounded-b-lg" source={isLoading ? 'Loading...' : fileContent} />
    </div>
  )
}
