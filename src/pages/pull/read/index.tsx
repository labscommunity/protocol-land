import { Tab } from '@headlessui/react'
import { useEffect } from 'react'
import Lottie from 'react-lottie'
import { useLocation, useParams } from 'react-router-dom'

import loadingFilesAnimation from '@/assets/searching-files.json'
import { trackGoogleAnalyticsPageView } from '@/helpers/google-analytics'
import { useGlobalStore } from '@/stores/globalStore'

import PullRequestHeader from './components/PullRequestHeader'
import { rootTabConfig } from './config/tabConfig'

const activeClasses = 'border-b-[2px] border-primary-600 text-gray-900 font-medium'

export default function ReadPullRequest() {
  const location = useLocation()
  const { id, pullId } = useParams()
  const [selectedRepo, fetchAndLoadRepository, pullRequestActions] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo,
    state.repoCoreActions.fetchAndLoadRepository,
    state.pullRequestActions
  ])

  useEffect(() => {
    if (id) {
      fetchAndLoadRepository(id)
    }
  }, [id])

  useEffect(() => {
    if (selectedRepo.repo) {
      const PR = selectedRepo.repo.pullRequests[+pullId! - 1]

      if (!PR) return

      pullRequestActions.compareBranches(PR.baseBranchOid, PR.compareBranch)
      pullRequestActions.getFileStatuses(PR.baseBranchOid, PR.compareBranch)

      pullRequestActions.setBaseBranch(PR.baseBranch)
      pullRequestActions.setCompareBranch(PR.compareBranch)
      pullRequestActions.setBaseBranchOid(PR.baseBranchOid)

      trackGoogleAnalyticsPageView('pageview', location.pathname, 'Read Pull Request Page Visit', {
        name: selectedRepo.repo.name,
        id: selectedRepo.repo.id,
        PR: {
          title: PR.title,
          id: PR.id,
          author: PR.author,
          status: PR.status
        }
      })
    }
  }, [selectedRepo.repo])

  const isLoading = selectedRepo.status === 'IDLE' || selectedRepo.status === 'PENDING'

  if (isLoading) {
    return (
      <div className="h-full flex-1 flex flex-col max-w-[1280px] mx-auto w-full mt-6 gap-8 justify-center items-center">
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingFilesAnimation,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice'
            }
          }}
          height={150}
          width={400}
        />
      </div>
    )
  }

  const PR = selectedRepo.repo ? selectedRepo.repo.pullRequests[+pullId! - 1] : null

  return (
    <div className="h-full flex-1 flex flex-col max-w-[1280px] mx-auto w-full mt-6 gap-8">
      {/* PR Meta Details open */}
      {PR && <PullRequestHeader PR={PR} />}
      {/* PR Meta Details close */}
      <div className="flex flex-col flex-1">
        <Tab.Group>
          <Tab.List className="flex text-gray-500 text-lg gap-10 border-b-[1px] border-gray-200">
            {rootTabConfig.map((tab) => (
              <Tab className="focus-visible:outline-none">
                {({ selected }) => (
                  <div className={`flex items-center gap-2 py-2 px-2 justify-center ${selected ? activeClasses : ''}`}>
                    <tab.Icon className="w-5 h-5" />
                    {tab.title}
                  </div>
                )}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className={'mt-4 px-2 flex flex-col flex-1'}>
            {rootTabConfig.map((TabItem) => (
              <Tab.Panel className={'flex flex-col flex-1'}>
                <TabItem.Component />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}
