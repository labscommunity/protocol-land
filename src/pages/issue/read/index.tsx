import { Tab } from '@headlessui/react'
import React from 'react'
import Lottie from 'react-lottie'
import { useParams } from 'react-router-dom'

import loadingFilesAnimation from '@/assets/load-files.json'
import { useGlobalStore } from '@/stores/globalStore'

import IssueHeader from './components/IssueHeader'
import { rootTabConfig } from './config/tabConfig'

const activeClasses = 'border-b-[2px] border-primary-600 text-gray-900 font-medium'

export default function ReadIssuePage() {
  const { id, issueId } = useParams()
  const [status, repo, selectedIssue, fetchAndLoadRepository, setSelectedIssue] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.status,
    state.repoCoreState.selectedRepo.repo,
    state.issuesState.selectedIssue,
    state.repoCoreActions.fetchAndLoadRepository,
    state.issuesActions.setSelectedIssue
  ])

  React.useEffect(() => {
    if (id) {
      fetchAndLoadRepository(id)
    }
  }, [id])

  React.useEffect(() => {
    if (repo) {
      const issue = repo.issues[+issueId! - 1]

      if (!issue) return

      setSelectedIssue(issue)
    }
  }, [repo])

  const isLoading = status === 'IDLE' || status === 'PENDING'

  if (isLoading || !repo || !selectedIssue) {
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

  return (
    <div className="h-full flex-1 flex flex-col max-w-[1280px] mx-auto w-full mt-6 gap-8 pb-16">
      {selectedIssue && <IssueHeader issue={selectedIssue} />}
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
