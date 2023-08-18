import { Tab } from '@headlessui/react'
import React from 'react'
import { BiCodeAlt } from 'react-icons/bi'
import { FiGitCommit, FiGitPullRequest } from 'react-icons/fi'
import { useParams } from 'react-router-dom'

import RepoHeader from './components/RepoHeader'
import CodeTab from './components/tabs/code-tab'
import CommitsTab from './components/tabs/CommitsTab'
import PullRequestsTab from './components/tabs/PullRequestsTab'
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
  }
]

export default function Repository() {
  const { txid } = useParams()
  const { fetchRepoMetaStatus, fetchedRepoMeta, initFetchRepoMeta } = useFetchRepositoryMeta({
    txId: txid!,
    initialFetchStatus: 'PENDING'
  })

  React.useLayoutEffect(() => {
    if (!fetchedRepoMeta) {
      initFetchRepoMeta()
    }
  }, [])

  console.log({ fetchedRepoMeta })
  return (
    <div className="h-full flex flex-col max-w-[1280px] mx-auto w-full mt-6 gap-4">
      <RepoHeader isLoading={fetchRepoMetaStatus === 'PENDING' && !fetchedRepoMeta} repo={fetchedRepoMeta!} />
      <div>
        <Tab.Group>
          <Tab.List className="flex text-liberty-dark-100 text-lg gap-10 border-b-[1px] border-[#cbc9f6] px-4">
            {tabData.map((tab) => (
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
          <Tab.Panels className={'mt-4 px-2'}>
            {tabData.map((TabItem) => (
              <Tab.Panel>
                <TabItem.Component />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}
