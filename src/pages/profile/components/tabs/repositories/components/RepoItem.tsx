import { IoIosArrowDroprightCircle } from 'react-icons/io'
import { Link } from 'react-router-dom'

import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { Repo } from '@/types/repository'

type Props = {
  title: string
  description: string
  id: string
  isPrivate: boolean
  parentRepo?: Pick<Repo, 'id' | 'name' | 'owner'>
}

export default function RepoItem({ title, description, id, parentRepo, isPrivate }: Props) {
  if ((!title && !description) || !id) return null

  return (
    <div className="flex p-4 hover:border-primary-600 justify-between items-center rounded-lg border-[1px] bg-white border-gray-300 w-full">
      <div className="flex flex-col gap-4 justify-between h-full">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Link to={`/repository/${id}`} className="text-xl font-bold text-gray-900 hover:underline hover:text-black">
              {title}
            </Link>
            <span className={`border-[1px] border-primary-600 text-primary-600 rounded-full px-2 text-sm`}>
              {isPrivate ? 'Private' : 'Public'}
            </span>
          </div>

          {parentRepo && (
            <span className="text-sm">
              Forked from{' '}
              <Link to={`/repository/${parentRepo.id}`} className="text-gray-600 underline hover:text-primary-700">
                {resolveUsernameOrShorten(parentRepo.owner)}/{parentRepo.name}
              </Link>{' '}
            </span>
          )}
        </div>
        <span className="text-gray-600 text-md">{description}</span>
      </div>
    </div>
  )
}
