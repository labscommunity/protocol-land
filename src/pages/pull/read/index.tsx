import { Tab } from '@headlessui/react'
import { useEffect } from 'react'
import Lottie from 'react-lottie'
import { useParams } from 'react-router-dom'

import loadingFilesAnimation from '@/assets/load-files.json'
import { useGlobalStore } from '@/stores/globalStore'

import PullRequestHeader from './components/PullRequestHeader'
import { rootTabConfig } from './config/tabConfig'

const activeClasses = 'border-b-[3px] border-[#8a6bec] text-[#8a6bec] font-medium'

export default function ReadPullRequest() {
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
          height={200}
          width={800}
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
          <Tab.List className="flex text-liberty-dark-100 text-lg gap-10 border-b-[1px] border-[#cbc9f6]">
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
