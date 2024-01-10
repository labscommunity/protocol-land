import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'

import CodeFileIcon from '@/assets/icons/code-file.svg'
import CodeFolderIcon from '@/assets/icons/code-folder.svg'
import { PL_REPO_ID } from '@/helpers/constants'

import { tabs } from './config'

export default function Row({ item }: { item: any }) {
  const navigate = useNavigate()

  const Icon = item.isFolder ? CodeFolderIcon : CodeFileIcon

  function handleRowClick() {
    navigate(tabs[0].getPath(PL_REPO_ID))
  }

  return (
    <div
      onClick={handleRowClick}
      className="self-stretch px-3 py-2 border-b border-gray-300 justify-center items-center gap-3 flex bg-gray-50 cursor-pointer hover:bg-primary-50 hover:text-gray-900 last:border-b-0 last:rounded-md text-slate-800 text-xs md:text-sm font-normal font-inter leading-none"
    >
      <div className="w-4 h-4">
        <SVG src={Icon} className="w-full h-full" />
      </div>
      <div className="grow shrink basis-0">{item.name}</div>
      <div className="grow shrink basis-0 hidden md:block">{item.description}</div>
      <div>
        <div className="grow shrink basis-0">{item.date}</div>
      </div>
    </div>
  )
}
