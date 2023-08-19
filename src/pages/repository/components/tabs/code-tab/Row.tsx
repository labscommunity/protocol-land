import { AiFillFolder, AiOutlineFileText } from 'react-icons/ai'

type Props = {
  isFolder: boolean
  item: any
  onClick: (items: any) => void
}

export default function Row({ isFolder, item, onClick }: Props) {
  const Icon = isFolder ? AiFillFolder : AiOutlineFileText

  function handleRowClick() {
    if (isFolder) onClick(item)
  }

  return (
    <div
      onClick={handleRowClick}
      className="flex cursor-pointer hover:bg-liberty-light-300 items-center gap-2 py-2 px-4 border-b-[1px] border-liberty-light-600 last:border-b-0"
    >
      <Icon className="w-5 h-5" /> <span>{item.path}</span>
    </div>
  )
}
