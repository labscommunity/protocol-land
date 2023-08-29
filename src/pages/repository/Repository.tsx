import { Tab } from '@headlessui/react'
import React from 'react'
import { BiCodeAlt } from 'react-icons/bi'
import { FiGitCommit, FiGitPullRequest, FiSettings } from 'react-icons/fi'
import Lottie from 'react-lottie'
import { useParams } from 'react-router-dom'

import repoLoadingAnimation from '@/assets/repo-loading.json'

import RepoHeader from './components/RepoHeader'
import CodeTab from './components/tabs/code-tab'
import CommitsTab from './components/tabs/commits-tab'
import PullRequestsTab from './components/tabs/PullRequestsTab'
import SettingsTab from './components/tabs/settings-tab'
import useFetchRepository from './hooks/useFetchRepository'
import { useFetchRepositoryMeta } from './hooks/useFetchRepositoryMeta'

const activeClasses = 'border-b-[3px] border-[#8a6bec] text-[#8a6bec] font-medium'
const tabData = [
  {
    title: 'Code',
    Component: CodeTab,
    Icon: BiCodeAlt
  },
  {
    title: 'Commits',
    Component: CommitsTab,
    Icon: FiGitCommit
  },
  {
    title: 'Pull Requests',
    Component: PullRequestsTab,
    Icon: FiGitPullRequest
  },
  {
    title: 'Settings',
    Component: SettingsTab,
    Icon: FiSettings
  }
]

export default function Repository() {
  const { id } = useParams()
  const { fetchRepoMetaStatus, fetchedRepoMeta, initFetchRepoMeta } = useFetchRepositoryMeta({
    id: id!,
    initialFetchStatus: 'PENDING'
  })
  const { initFetchRepo, fetchRepoStatus } = useFetchRepository()

  React.useLayoutEffect(() => {
    if (!fetchedRepoMeta) {
      initFetchRepoMeta()
    }
  }, [])

  React.useEffect(() => {
    if (fetchRepoStatus === 'SUCCESS') return

    if (fetchedRepoMeta) {
      initFetchRepo(fetchedRepoMeta.name, fetchedRepoMeta.dataTxId)
    }
  }, [fetchedRepoMeta])

  const isReady = fetchRepoMetaStatus === 'SUCCESS' && fetchRepoStatus === 'SUCCESS'
  return (
    <div className="h-full flex-1 flex flex-col max-w-[1280px] mx-auto w-full mt-6 gap-4">
      <RepoHeader isLoading={fetchRepoMetaStatus === 'PENDING' && !fetchedRepoMeta} repo={fetchedRepoMeta!} />
      {(fetchRepoMetaStatus === 'PENDING' || fetchRepoStatus === 'PENDING') && (
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
          <Tab.Group>
            <Tab.List className="flex text-liberty-dark-100 text-lg gap-10 border-b-[1px] border-[#cbc9f6] px-4">
              {tabData.map((tab) => (
                <Tab className="focus-visible:outline-none">
                  {({ selected }) => (
                    <div
                      className={`flex items-center gap-2 py-2 px-2 justify-center ${selected ? activeClasses : ''}`}
                    >
                      <tab.Icon className="w-5 h-5" />
                      {tab.title}
                    </div>
                  )}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className={'mt-4 px-2 flex flex-col flex-1'}>
              {tabData.map((TabItem) => (
                <Tab.Panel className={'flex flex-col flex-1'}>
                  <TabItem.Component repoName={fetchedRepoMeta?.name ?? ''} />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </div>
  )
}
