import { useGlobalStore } from '@/stores/globalStore'
import { Repo } from '@/types/repository'

export default function Sidebar({ repos }: { repos: Repo[] }) {
  const [isLoggedIn] = useGlobalStore((state) => [state.auth.isLoggedIn])
  const hasRepos = isLoggedIn === true && repos.length > 0

  return (
    <div className="w-[20%] py-8 px-6 border-r-[1px] border-[#cbc9f6]">
      <h1 className="text-xl font-medium text-center text-liberty-dark-100">Repositories</h1>

      {!isLoggedIn && (
        <div className="w-full text-center py-4">
          <h3 className="text-liberty-dark-100">Login to view your repositories</h3>
        </div>
      )}
      {!hasRepos && (
        <div className="w-full text-center py-4">
          <h3 className="text-liberty-dark-100">No repositories found</h3>
        </div>
      )}
      {hasRepos && (
        <div className="w-full text-center py-4">
          {repos.map((repo) => (
            <h3 className="text-liberty-dark-100">{repo.name}</h3>
          ))}
        </div>
      )}
    </div>
  )
}
