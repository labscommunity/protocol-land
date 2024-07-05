import MDEditor from '@uiw/react-md-editor'
import React from 'react'
import { FadeLoader } from 'react-spinners'

import rehypeAnchorOnClickPlugin from '@/helpers/rehypeAnchorOnClickPlugin'
import { Hackathon } from '@/types/hackathon'

type Props = {
  selectedHackathon: Hackathon
}
export default function DetailsTab({ selectedHackathon }: Props) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [details, setDetails] = React.useState('')

  React.useEffect(() => {
    if (selectedHackathon) {
      fetchDetails()
    }
  }, [selectedHackathon])
  async function fetchDetails() {
    setIsLoading(true)
    const res = await fetch(`https://arweave.net/${selectedHackathon.descriptionTxId}`)
    const data = await res.text()

    setDetails(data)
    setIsLoading(false)
  }

  return (
    <div className="py-4 w-full">
      {isLoading && (
        <div className="w-full !min-h-[200px] flex items-center justify-center h-full">
          <FadeLoader color="#56ADD9" />
        </div>
      )}
      {!isLoading && (
        <MDEditor.Markdown
          className="!min-h-[200px] rounded-b-lg !bg-transparent"
          source={details}
          rehypePlugins={[[rehypeAnchorOnClickPlugin]]}
        />
      )}
    </div>
  )
}
