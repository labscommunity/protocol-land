import 'react-mde/lib/styles/css/react-mde-all.css'

import React from 'react'
import { AiFillEdit } from 'react-icons/ai'
import ReactMde from 'react-mde'
import { useParams } from 'react-router-dom'
import MarkdownView from 'react-showdown'
import * as Showdown from 'showdown'

import { Button } from '@/components/common/buttons'
import { withAsync } from '@/helpers/withAsync'
import { uploadUserReadMe } from '@/lib/user'
import { useGlobalStore } from '@/stores/globalStore'

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true
})
converter.setFlavor('github')

export default function ReadMe({ readmeTxId }: { readmeTxId: string }) {
  const { id } = useParams()
  const [submitting, setSubmitting] = React.useState(false)
  const [mode, setMode] = React.useState<'READ' | 'EDIT'>('READ')
  const [address, isLoggedIn, saveUserDetails] = useGlobalStore((state) => [
    state.authState.address,
    state.authState.isLoggedIn,
    state.userActions.saveUserDetails
  ])
  const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>('write')
  const [content, setContent] = React.useState(
    '<div class="flex p-4 justify-center w-full">Hi there! 👋 Share a bit about yourself, your interests, and what you do.</div>'
  )

  React.useEffect(() => {
    if (readmeTxId) {
      loadReadMe(readmeTxId)
    }
  }, [readmeTxId])

  async function handleSaveButtonClick() {
    setSubmitting(true)

    if (content.length > 0) {
      const { response } = await withAsync(() => uploadUserReadMe(content))

      if (response) {
        //
        await saveUserDetails({ readmeTxId: response }, id!)
        setMode('READ')
      }
    }

    setSubmitting(false)
  }

  async function loadReadMe(id: string) {
    const res = await fetch(`https://arweave.net/${id}`)
    const text = await res.text()

    if (text.length > 0) {
      setContent(text)
    }
  }

  if (mode === 'EDIT') {
    return (
      <div className="flex flex-col w-full gap-4">
        <div className="flex justify-end gap-2 mt-2">
          <Button
            isLoading={submitting}
            disabled={submitting}
            onClick={handleSaveButtonClick}
            className="rounded-full flex items-center py-[4px] justify-center"
            variant="solid"
          >
            Save
          </Button>
          <Button
            onClick={() => setMode('READ')}
            className="rounded-full flex items-center py-[4px] justify-center"
            variant="outline"
          >
            Cancel
          </Button>
        </div>
        <ReactMde
          value={content}
          onChange={setContent}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          generateMarkdownPreview={(markdown) => Promise.resolve(converter.makeHtml(markdown))}
          classes={{
            reactMde: 'rounded-lg',
            preview: 'bg-white'
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex w-full">
      <div className="flex flex-col bg-white w-full rounded-lg border-[1px] border-[#cbc9f6] px-4 py-2">
        <div className="flex justify-end">
          {address === id! && isLoggedIn && (
            <div
              onClick={() => setMode('EDIT')}
              className="flex gap-2 items-center hover:border-b-[1px] border-liberty-dark-100 cursor-pointer"
            >
              <AiFillEdit className="w-5 h-5 text-liberty-dark-100" />
              <span className="text-liberty-dark-100 font-medium">Edit</span>
            </div>
          )}
        </div>
        <div className="flex p-2 w-full mde-preview">
          <MarkdownView
            className="mde-preview-content w-full [&>ul]:list-disc"
            markdown={content}
            options={{ tables: true, emoji: true, tasklists: true }}
          />
        </div>
      </div>
    </div>
  )
}
