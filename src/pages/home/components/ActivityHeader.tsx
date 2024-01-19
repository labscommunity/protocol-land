import { Link } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { Repo } from '@/types/repository'

export default function ActivityHeader({ repo }: { repo: Repo }) {
  return (
    <div className="flex flex-col">
      <Link
        to={`/repository/${repo.id}`}
        className="font-medium text-lg hover:underline text-primary-600 hover:text-primary-700 cursor-pointer"
      >
        {repo.name}
      </Link>
      <div className="text-sm">
        <span>Owner: </span>
        <Link
          to={`/user/${repo.owner}`}
          className="font-medium hover:underline text-primary-600 hover:text-primary-700 cursor-pointer"
        >
          {shortenAddress(repo.owner)}
        </Link>
      </div>
    </div>
  )
}
