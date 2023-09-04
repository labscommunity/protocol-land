import { EditorState } from '@codemirror/state'
import { langs } from '@uiw/codemirror-extensions-langs'
import { EditorView } from 'codemirror'
import { useEffect, useState } from 'react'
import CodeMirrorMerge from 'react-codemirror-merge'

import { withAsync } from '@/helpers/withAsync'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { readFileFromRef } from '@/lib/git/pull-request'
import { FileStatus } from '@/stores/pull-request/types'

type Props = {
  fileStatus: FileStatus
  base: string
  compare: string
  repoName: string
}

export default function FileCompareComponent({ fileStatus, base, compare, repoName }: Props) {
  const [baseValue, setBaseValue] = useState('')
  const [compareValue, setCompareValue] = useState('')

  useEffect(() => {
    initReadFromFilesToCompare()
  }, [])

  async function initReadFromFilesToCompare() {
    const fs = fsWithName(repoName)
    const dir = `/${repoName}`

    const { error: compareErr, response: compareResponse } = await withAsync(() =>
      readFileFromRef({ fs, dir, ref: compare, filePath: fileStatus[0] })
    )
    const { error: baseErr, response: baseResponse } = await withAsync(() =>
      readFileFromRef({ fs, dir, ref: base, filePath: fileStatus[0] })
    )

    if (!compareErr && compareResponse) {
      setCompareValue(compareResponse)
    }

    if (!baseErr && baseResponse) {
      setBaseValue(baseResponse)
    }
  }

  const Original = CodeMirrorMerge.Original
  const Modified = CodeMirrorMerge.Modified
  
  return (
    <div className="w-full py-2 flex flex-col ">
      <div className="flex font-medium bg-[#5E70AB] px-4 py-2 text-white rounded-t-xl overflow-hidden">
        {fileStatus[0]}
      </div>
      <CodeMirrorMerge
        collapseUnchanged={{}}
        className="bg-white"
        theme={'dark'}
        orientation="a-b"
        highlightChanges={true}
      >
        <Original
          extensions={[langs.javascript({ jsx: true }), EditorView.editable.of(false), EditorState.readOnly.of(true)]}
          value={baseValue}
        />
        <Modified
          value={compareValue}
          extensions={[langs.javascript({ jsx: true }), EditorView.editable.of(false), EditorState.readOnly.of(true)]}
        />
      </CodeMirrorMerge>
    </div>
  )
}
