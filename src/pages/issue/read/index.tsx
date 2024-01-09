import { Tab } from '@headlessui/react'
import React from 'react'
import Lottie from 'react-lottie'
import { useLocation, useParams } from 'react-router-dom'

import loadingFilesAnimation from '@/assets/searching-files.json'
import PageNotFound from '@/components/PageNotFound'
import ScrollToTop from '@/components/ScrollToTop'
import { trackGoogleAnalyticsPageView } from '@/helpers/google-analytics'
import { useGlobalStore } from '@/stores/globalStore'

import IssueHeader from './components/IssueHeader'
import { rootTabConfig } from './config/tabConfig'

const activeClasses = 'border-b-[2px] border-primary-600 text-gray-900 font-medium'

export default function ReadIssuePage() {
  const { id, issueId } = useParams()
  const location = useLocation()

  const [status, repo, selectedIssue, fetchAndLoadRepository, setSelectedIssue, branchState] = useGlobalStore(
    (state) => [
      state.repoCoreState.selectedRepo.status,
      state.repoCoreState.selectedRepo.repo,
      state.issuesState.selectedIssue,
      state.repoCoreActions.fetchAndLoadRepository,
      state.issuesActions.setSelectedIssue,
      state.branchState
    ]
  )

  React.useEffect(() => {
    if (id) {
      fetchAndLoadRepository(id, branchState.currentBranch)
    }
  }, [id])

  React.useEffect(() => {
    if (repo) {
      const issue = repo.issues[+issueId! - 1]

      if (!issue) return

      setSelectedIssue(issue)

      trackGoogleAnalyticsPageView('pageview', location.pathname, 'Read Issue Page Visit', {
        repo_name: repo.name,
        repo_id: repo.id,
        issue_title: issue.title,
        issue_id: issue.id,
        issue_author: issue.author,
        issue_status: issue.status
      })
    }
  }, [repo])

  const isLoading = status === 'IDLE' || status === 'PENDING'

  if (status === 'ERROR') {
    return <PageNotFound />
  }

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
          height={150}
          width={400}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex-1 flex flex-col max-w-[1280px] px-8 mx-auto w-full mt-6 gap-8 pb-16">
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
      <ScrollToTop />
    </div>
  )
}
