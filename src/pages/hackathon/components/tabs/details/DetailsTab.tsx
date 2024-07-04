import MDEditor from '@uiw/react-md-editor'
import React from 'react'

import rehypeAnchorOnClickPlugin from '@/helpers/rehypeAnchorOnClickPlugin'

export default function DetailsTab() {
  return (
    <div className="py-4">
      <MDEditor.Markdown
        className="!min-h-[200px] rounded-b-lg !bg-transparent"
        source={'## Hello world!'}
        rehypePlugins={[[rehypeAnchorOnClickPlugin]]}
      />
    </div>
  )
}
