import React from 'react'
import { AiOutlinePlus } from 'react-icons/ai'
import { FiChevronDown, FiGitBranch } from 'react-icons/fi'

import { Button } from '@/components/common/buttons'
import { prepareExplorerData } from '@/pages/repository/helpers/prepareExplorerData'

import Row from './Row'

export default function CodeTab() {
  const files = ['src/lib/index.ts', 'assets/test.jpg', '.gitignore', 'Cargo.lock']
  const explorerData = prepareExplorerData(files)
  const [data, setData] = React.useState(explorerData)

  function handleFolderClick(newData: typeof explorerData) {
    setData(newData)
  }

  function handleBackClick() {
    if (!data.parent) return

    setData(data.parent)
  }
  
  console.log({ data })
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between">
        <Button className="rounded-lg flex items-center py-[4px] px-4 font-medium gap-2" variant="outline">
          <FiGitBranch /> main <FiChevronDown className="h-5 w-5" aria-hidden="true" />
        </Button>
        <Button className="rounded-lg flex items-center py-[4px] px-4 font-medium gap-1" variant="solid">
          <AiOutlinePlus className="w-5 h-5" /> Add Files
        </Button>
      </div>
      <div className="flex w-full">
        <div className="border-liberty-light-200 border-[1.5px] w-full rounded-lg bg-[whitesmoke] text-liberty-dark-100 overflow-hidden">
          <div className="flex justify-between bg-liberty-light-800 text-[whitesmoke] items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-400">
            <span>Sai Kranthi</span>
            <div className="w-[40%] flex justify-between">
              <span>initial commit</span>
              <span>a2d0c3</span>
              <span> 3 days ago</span>
            </div>
          </div>
          {data.parent && (
            <div
              onClick={handleBackClick}
              className="flex cursor-pointer hover:bg-liberty-light-300 items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-600"
            >
              <span>...</span>
            </div>
          )}
          {data.items.map((item) => (
            <Row onClick={handleFolderClick} item={item} isFolder={item.isFolder} />
          ))}
        </div>
      </div>
    </div>
  )
}
