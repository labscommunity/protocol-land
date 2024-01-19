import MDEditor from '@uiw/react-md-editor'
import React, { useEffect } from 'react'
import { LiaReadme } from 'react-icons/lia'

import { getFileContent } from '@/pages/repository/helpers/filenameHelper'
import { useGlobalStore } from '@/stores/globalStore'
import { FileObject } from '@/stores/repository-core/types'

export default function Readme({ fileObject }: { fileObject?: FileObject }) {
  const [fileContent, setFileContent] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [gitActions] = useGlobalStore((state) => [state.repoCoreActions.git])

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

  if (!fileObject) return null

  return (
    <div className="border border-gray-300 rounded-lg">
      <div className="sticky -top-1 z-10 h-12 flex items-center gap-2 bg-gray-200 border-gray-300 border-b rounded-t-lg px-4">
        <LiaReadme className="w-5 h-5" />
        <div className="font-medium">README</div>
      </div>
      <MDEditor.Markdown className="p-8 !min-h-[200px] rounded-b-lg" source={isLoading ? 'Loading...' : fileContent} />
    </div>
  )
}
