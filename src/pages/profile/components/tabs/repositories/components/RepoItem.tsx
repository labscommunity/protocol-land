import { IoIosArrowDroprightCircle } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'

type Props = {
  title: string
  description: string
  id: string
}

export default function RepoItem({ title, description, id }: Props) {
  const navigate = useNavigate()

  function handleRepoClick() {
    navigate(`/repository/${id}`)
  }

  if ((!title && !description) || !id) return null

  return (
    <div
      onClick={handleRepoClick}
      className="flex p-4 cursor-pointer hover:border-primary-600 justify-between items-center rounded-lg border-[1px] bg-white border-gray-300 w-full"
    >
      <div className="flex flex-col gap-6 justify-between h-full">
        <span className="text-xl font-bold text-gray-900">{title}</span>
        <span className="text-gray-600 text-md">{description}</span>
      </div>
      <IoIosArrowDroprightCircle className="w-8 h-8 text-gray-600" />
    </div>
  )
}
