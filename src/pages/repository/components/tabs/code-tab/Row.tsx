import clsx from 'clsx'
import SVG from 'react-inlinesvg'

import CodeFileIcon from '@/assets/icons/code-file.svg'
import CodeFolderIcon from '@/assets/icons/code-folder.svg'

type Props = {
  isFolder: boolean
  item: any
  onFolderClick: (items: any) => void
  onFileClick: (items: any) => void
}

export default function Row({ isFolder, item, onFolderClick, onFileClick }: Props) {
  const Icon = isFolder ? CodeFolderIcon : CodeFileIcon

  function handleRowClick() {
    if (isFolder) onFolderClick(item)
    if (!isFolder) onFileClick(item)
  }

  return (
    <div
      onClick={handleRowClick}
      className="flex bg-gray-50 cursor-pointer hover:bg-primary-50 text-gray-600 hover:text-gray-900 items-center gap-4 py-[10px] px-4 border-b-[1px] border-gray-300 last:border-b-0"
    >
      <SVG src={Icon} className={clsx('w-5 h-5', item.type === 'folder' && 'fill-primary-600 stroke-primary-600')} />{' '}
      <span>{item.path}</span>
    </div>
  )
}
