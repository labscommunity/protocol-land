import clsx from 'clsx'
import { useMemo, useState } from 'react'

import { useGlobalStore } from '@/stores/globalStore'
import { RepoWithParent } from '@/types/repository'

import RepoItem from './components/RepoItem'

export default function RepositoriesTab({ userRepos }: { userRepos: RepoWithParent[] }) {
  const [connectedAddress] = useGlobalStore((state) => [state.authState.address])
  const [searchTerm, setSearchTerm] = useState('')
  const filteredRepos = useMemo(() => {
    if (searchTerm && userRepos.length > 0) {
      return userRepos.filter((repo) => repo.name.includes(searchTerm))
    }
    return userRepos
  }, [userRepos, searchTerm])

  return (
    <div>
      <input
        type="text"
        className={clsx(
          'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-2 outline-none border-gray-300'
        )}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Find a repository..."
      />
      <div className="flex flex-col w-full gap-3 mt-6">
        {filteredRepos.map((repo) => {
          const isContributor =
            connectedAddress && (connectedAddress === repo.owner || repo.contributors.includes(connectedAddress))
          if (repo.private && !isContributor) return null
          return (
            <RepoItem
              id={repo.id}
              title={repo.name}
              description={repo.description}
              parentRepo={repo.parentRepo}
              isPrivate={repo.private}
            />
          )
        })}
      </div>
    </div>
  )
}
