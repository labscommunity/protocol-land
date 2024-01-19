import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { Repo } from '@/types/repository'

export default function ActivityHeader({ repo }: { repo: Repo }) {
  return (
    <div className="flex items-center gap-3">
      <Link
        className="font-normal text-base hover:underline text-primary-600 hover:text-primary-700 cursor-pointer"
        to={`/user/${repo.owner}`}
      >
        {shortenAddress(repo.owner)}
      </Link>
      <span className="text-gray-400">/</span>
      <div className="flex items-center">
        <Link
          className="font-semibold text-lg hover:underline text-primary-800 hover:text-primary-900 cursor-pointer"
          to={`/repository/${repo.id}`}
        >
          {repo.name}
        </Link>
      </div>
    </div>
  )
}
