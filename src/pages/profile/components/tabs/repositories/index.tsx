import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { useGlobalStore } from '@/stores/globalStore'
import { RepoWithParent } from '@/types/repository'

import RepoItem from './components/RepoItem'

export default function RepositoriesTab({ userRepos }: { userRepos: RepoWithParent[] }) {
  const { id: userAddress } = useParams()
  const [connectedAddress] = useGlobalStore((state) => [state.authState.address])
  const [searchTerm, setSearchTerm] = useState('')
  const filteredRepos = useMemo(() => {
    if (userRepos.length > 0) {
      return userRepos.filter((repo) => {
        if (repo.name.includes(searchTerm)) {
          if (repo.private) {
            const isContributor =
              userAddress &&
              connectedAddress &&
              userAddress === connectedAddress &&
              (userAddress === repo.owner || (repo.contributors ?? []).includes(userAddress))
            if (!isContributor) return false
          }
          return true
        }
        return false
      })
    }
    return userRepos
  }, [userRepos, searchTerm, connectedAddress])

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
        {filteredRepos.map((repo) => (
          <RepoItem
            id={repo.id}
            title={repo.name}
            description={repo.description}
            parentRepo={repo.parentRepo}
            isPrivate={repo.private}
          />
        ))}
        {filteredRepos.length === 0 &&
          (filteredRepos.length === userRepos.length ? (
            <span className="text-center font-medium">
              {resolveUsernameOrShorten(userAddress!)} doesn't have any repositories yet.
            </span>
          ) : (
            <span className="text-center">
              <b>0</b> results for repositories matching <b>{searchTerm}</b>
            </span>
          ))}
      </div>
    </div>
  )
}
