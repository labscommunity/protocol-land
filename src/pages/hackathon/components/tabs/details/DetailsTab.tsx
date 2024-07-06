import MDEditor from '@uiw/react-md-editor'
import React from 'react'
import { FadeLoader } from 'react-spinners'

import { Button } from '@/components/common/buttons'
import { withAsync } from '@/helpers/withAsync'
import { uploadDetailsReadme } from '@/pages/hackathon/utils/uploadDetailsReadme'
import { useGlobalStore } from '@/stores/globalStore'
import { Hackathon } from '@/types/hackathon'

type Props = {
  selectedHackathon: Hackathon
}
export default function DetailsTab({ selectedHackathon }: Props) {
  const [editDetails, setEditDetails] = React.useState(false)
  const [address, updateHackathon] = useGlobalStore((state) => [
    state.authState.address,
    state.hackathonActions.updateHackathon
  ])

  const [isLoading, setIsLoading] = React.useState(false)
  const [details, setDetails] = React.useState('')

  React.useEffect(() => {
    if (selectedHackathon) {
      fetchDetails()
    }
  }, [selectedHackathon])
  const originalData = React.useRef<null | string>(null)
  async function fetchDetails() {
    setIsLoading(true)
    const res = await fetch(`https://arweave.net/${selectedHackathon.descriptionTxId}`)
    const data = await res.text()
    originalData.current = data
    setDetails(data)
    setIsLoading(false)
  }

  async function handleDetailsSave() {
    if (details !== originalData.current) {
      setIsLoading(true)
      const { response: descriptionTxId } = await withAsync(() => uploadDetailsReadme(details, selectedHackathon.id))
      await updateHackathon({
        id: selectedHackathon?.id,
        descriptionTxId
      })
    }
    setIsLoading(false)

    setEditDetails(false)
  }

  return (
    <div className="w-full">
      {isLoading && (
        <div className="w-full !min-h-[200px] flex items-center justify-center h-full">
          <FadeLoader color="#56ADD9" />
        </div>
      )}
      {!isLoading && !editDetails && (
        <div>
          <div className="flex justify-end">
            {address === selectedHackathon?.createdBy && (
              <Button onClick={() => setEditDetails(true)} variant="primary-outline" className="py-[2px]">
                Edit
              </Button>
            )}
          </div>
          <div className="py-4">
            <MDEditor.Markdown
              className="!min-h-[200px] rounded-b-lg !bg-transparent"
              source={details}
              // rehypePlugins={[[rehypeAnchorOnClickPlugin]]}
            />
          </div>
        </div>
      )}
      {editDetails && !isLoading && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex justify-end">
            <Button onClick={handleDetailsSave} variant="primary-solid" className="py-[2px]">
              Save
            </Button>
          </div>
          <MDEditor
            height={700}
            preview="edit"
            value={details}
            onChange={(val) => {
              setDetails(val!)
            }}
          />
        </div>
      )}
    </div>
  )
}
