import { Tab } from '@headlessui/react'
import React, { useState } from 'react'
import Lottie from 'react-lottie'
import { useNavigate, useParams } from 'react-router-dom'

import repoLoadingAnimation from '@/assets/repo-loading.json'
import PageNotFound from '@/components/PageNotFound'
import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { useGlobalStore } from '@/stores/globalStore'

import RepoHeader from './components/RepoHeader'
import { rootTabConfig } from './config/rootTabConfig'

const activeClasses = 'border-b-[2px] border-primary-600 text-gray-900 font-medium'

export default function Repository() {
  const { id, tabName, '*': branchName } = useParams()
  const navigate = useNavigate()
  const [branchAbscent, setBranchAbscent] = useState(false)
  const [authState, selectedRepo, parentRepo, fetchAndLoadRepository, reset, branchState] = useGlobalStore((state) => [
    state.authState,
    state.repoCoreState.selectedRepo,
    state.repoCoreState.parentRepo,
    state.repoCoreActions.fetchAndLoadRepository,
    state.repoCoreActions.reset,
    state.branchState
  ])
  const selectedIndex = React.useMemo(() => {
    if (!tabName) return 0
    const tabNames = rootTabConfig.map((tab) => tab.title.toLocaleLowerCase())
    const name = tabName === 'pulls' ? 'pull requests' : tabName === 'tree' ? 'code' : tabName
    return tabNames.indexOf(name)
  }, [tabName])

  const invalidTabName = selectedIndex === -1

  React.useEffect(() => {
    // Determine the branch to load:
    // If branchName is provided, use it.
    // Otherwise, if tabName is present, load the current branch from branchState.
    // If neither branchName nor tabName is available, default to the master branch.
    if (isPageNotFound) return
    const loadBranch = branchName || (tabName ? branchState.currentBranch : 'master')
    fetchAndLoadRepository(id!, loadBranch).then((currentBranch) => {
      if (branchName && currentBranch && currentBranch !== branchName) {
        setBranchAbscent(true)
      }
    })

    return () => reset()
  }, [id])

  function handleTabChangeEventTracking(idx: number) {
    const tab = rootTabConfig[idx]
    const repo = selectedRepo.repo

    const targetPath = tab.getPath(id!, branchName || branchState.currentBranch)

    navigate(targetPath)

    if (tab && repo) {
      trackGoogleAnalyticsEvent('Repository', 'Tab click to change active tab', 'Change tab', {
        tab: tab.title,
        repo_name: repo.name,
        repo_id: repo.id
      })
    }
  }

  const isPageNotFound =
    selectedRepo.status === 'ERROR' ||
    (tabName && invalidTabName) ||
    (tabName === 'tree' && !branchName) ||
    branchAbscent

  const isReady = selectedRepo.status === 'SUCCESS'

  if (isPageNotFound) return <PageNotFound />

  return (
    <div className="h-full flex-1 flex flex-col max-w-[1280px] mx-auto w-full mt-6 gap-2">
      <RepoHeader
        owner={authState.address}
        isLoading={!isReady}
        repo={selectedRepo.repo!}
        parentRepo={parentRepo.repo}
      />
      {!isReady && (
        <div className="flex h-[70%] items-center">
          <Lottie
            options={{
              loop: true,
              autoplay: true,
              animationData: repoLoadingAnimation,
              rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
              }
            }}
            height={400}
            width={400}
          />
        </div>
      )}
      {isReady && (
        <div className="flex flex-col flex-1">
          <Tab.Group onChange={handleTabChangeEventTracking} selectedIndex={selectedIndex}>
            <Tab.List className="flex text-gray-500 text-lg gap-10 border-b-[1px] border-gray-200">
              {rootTabConfig
                .filter((tab) => {
                  if (authState.isLoggedIn) return true

                  return tab.title !== 'Settings'
                })
                .map((tab, index) => (
                  <Tab className="focus-visible:outline-none" key={index}>
                    {({ selected }) => (
                      <div
                        className={`flex items-center gap-2 py-[10px] px-4 justify-center ${
                          selected ? activeClasses : ''
                        }`}
                      >
                        <tab.Icon className="w-5 h-5" />
                        {tab.title}
                      </div>
                    )}
                  </Tab>
                ))}
            </Tab.List>
            <Tab.Panels className={'mt-4 flex flex-col flex-1'}>
              {rootTabConfig
                .filter((tab) => {
                  if (authState.isLoggedIn) return true

                  return tab.title !== 'Settings'
                })
                .map((TabItem) => (
                  <Tab.Panel className={'flex flex-col flex-1'}>
                    <TabItem.Component repoName={selectedRepo.repo?.name ?? ''} id={selectedRepo.repo?.id ?? ''} />
                  </Tab.Panel>
                ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </div>
  )
}
