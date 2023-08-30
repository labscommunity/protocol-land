import { Tab } from '@headlessui/react'
import React from 'react'
import Lottie from 'react-lottie'
import { useParams } from 'react-router-dom'

import repoLoadingAnimation from '@/assets/repo-loading.json'
import { useGlobalStore } from '@/stores/globalStore'

import RepoHeader from './components/RepoHeader'
import { rootTabConfig } from './config/rootTabConfig'
import useFetchRepository from './hooks/useFetchRepository'

const activeClasses = 'border-b-[3px] border-[#8a6bec] text-[#8a6bec] font-medium'

export default function Repository() {
  const { id } = useParams()
  const [selectedRepo, fetchRepoMetadata] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo,
    state.repoCoreActions.fetchRepoMetadata
  ])
  const { initFetchRepo, fetchRepoStatus } = useFetchRepository()

  React.useEffect(() => {
    fetchRepoMetadata(id!)
  }, [])

  React.useEffect(() => {
    if (fetchRepoStatus === 'SUCCESS') return

    if (selectedRepo.repo) {
      initFetchRepo(selectedRepo.repo.name, selectedRepo.repo.dataTxId)
    }
  }, [selectedRepo])

  const isReady = selectedRepo.status === 'SUCCESS' && fetchRepoStatus === 'SUCCESS'

  return (
    <div className="h-full flex-1 flex flex-col max-w-[1280px] mx-auto w-full mt-6 gap-4">
      <RepoHeader isLoading={!isReady} repo={selectedRepo.repo!} />
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
          <Tab.Group>
            <Tab.List className="flex text-liberty-dark-100 text-lg gap-10 border-b-[1px] border-[#cbc9f6] px-4">
              {rootTabConfig.map((tab) => (
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
              {rootTabConfig.map((TabItem) => (
                <Tab.Panel className={'flex flex-col flex-1'}>
                  <TabItem.Component repoName={selectedRepo.repo?.name ?? ''} />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </div>
  )
}
