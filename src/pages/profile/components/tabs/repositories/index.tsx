import { Repo } from '@/types/repository'

import RepoItem from './components/RepoItem'

export default function RepositoriesTab({ userRepos }: { userRepos: Repo[] }) {
  return (
    <div className="flex flex-col w-full gap-3 mt-6">
      {userRepos.map((repo) => (
        <RepoItem id={repo.id} title={repo.name} description={repo.description} />
      ))}
    </div>
  )
}
