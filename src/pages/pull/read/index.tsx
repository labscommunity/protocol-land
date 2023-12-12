import { Tab } from '@headlessui/react'
import { useEffect, useState } from 'react'
import Lottie from 'react-lottie'
import { useLocation, useParams } from 'react-router-dom'

import loadingFilesAnimation from '@/assets/searching-files.json'
import PageNotFound from '@/components/PageNotFound'
import { trackGoogleAnalyticsPageView } from '@/helpers/google-analytics'
import { useGlobalStore } from '@/stores/globalStore'

import PullRequestHeader from './components/PullRequestHeader'
import { rootTabConfig } from './config/tabConfig'

const activeClasses = 'border-b-[2px] border-primary-600 text-gray-900 font-medium'

export default function ReadPullRequest() {
  const location = useLocation()
  const { id, pullId } = useParams()
  const [compareRepoOwner, setCompareRepoOwner] = useState('')
  const [
    selectedRepo,
    forkRepo,
    commits,
    branchState,
    fileStatuses,
    fetchAndLoadRepository,
    fetchAndLoadForkRepository,
    pullRequestActions
  ] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo,
    state.repoCoreState.forkRepo,
    state.pullRequestState.commits,
    state.branchState,
    state.pullRequestState.fileStatuses,
    state.repoCoreActions.fetchAndLoadRepository,
    state.repoCoreActions.fetchAndLoadForkRepository,
    state.pullRequestActions
  ])

  useEffect(() => {
    if (id) {
      fetchAndLoadRepository(id, branchState.currentBranch)
    }
  }, [id])

  useEffect(() => {
    if (selectedRepo.repo) {
      const PR = selectedRepo.repo.pullRequests[+pullId! - 1]

      if (!PR) return

      let compareIsFork = false

      if (PR.baseRepo.repoId !== PR.compareRepo.repoId) {
        const forks = Object.values(selectedRepo.repo.forks)
        const forkRepoIndex = forks.findIndex((fork) => fork.id === PR.compareRepo.repoId)
        compareIsFork = forkRepoIndex > -1

        if (compareIsFork) {
          setCompareRepoOwner(forks[forkRepoIndex].owner)
          fetchAndLoadForkRepository(PR.compareRepo.repoId)
          //
        }
      }

      const params = {
        base: {
          repoName: PR.baseRepo.repoName,
          branch: PR.baseBranch,
          id: PR.baseRepo.repoId
        },
        compare: {
          repoName: PR.compareRepo.repoName,
          branch: PR.compareBranch,
          id: PR.compareRepo.repoId
        }
      }

      pullRequestActions.compareBranches(params)

      if (!compareIsFork) {
        pullRequestActions.getFileStatuses(PR.baseBranchOid, PR.compareBranch)
        pullRequestActions.setCompareBranch(PR.compareBranch)
      }

      pullRequestActions.setBaseBranch(PR.baseBranch)
      pullRequestActions.setBaseBranchOid(PR.baseBranchOid)

      trackGoogleAnalyticsPageView('pageview', location.pathname, 'Read Pull Request Page Visit', {
        repo_name: selectedRepo.repo.name,
        repo_id: selectedRepo.repo.id,
        pr_title: PR.title,
        pr_id: PR.id,
        pr_author: PR.author,
        pr_status: PR.status
      })
    }
  }, [selectedRepo.repo])

  useEffect(() => {
    if (commits.length > 0 && forkRepo.repo && selectedRepo.repo) {
      const PR = selectedRepo.repo.pullRequests[+pullId! - 1]

      pullRequestActions.prepareAndCopyForkCommits(PR)
    }
  }, [commits, forkRepo])

  const isLoading = selectedRepo.status === 'IDLE' || selectedRepo.status === 'PENDING'

  if (selectedRepo.status === 'ERROR') {
    return <PageNotFound />
  }

  if (isLoading || fileStatuses.length === 0) {
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
      {PR && <PullRequestHeader PR={PR} repo={selectedRepo.repo!} compareRepoOwner={compareRepoOwner} />}
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
