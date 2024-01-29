import { useGlobalStore } from '@/stores/globalStore'
import { RepoWithParent } from '@/types/repository'

import RepoItem from './components/RepoItem'

export default function RepositoriesTab({ userRepos }: { userRepos: RepoWithParent[] }) {
  const [connectedAddress] = useGlobalStore((state) => [state.authState.address])

  return (
    <div className="flex flex-col w-full gap-3 mt-6">
      {userRepos.map((repo) => {
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
  )
}
