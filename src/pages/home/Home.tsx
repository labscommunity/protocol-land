import { useConnection } from '@arweave-wallet-kit-beta/react'
import React from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import CreateProfileModal from '@/components/CreateProfileModal/CreateProfileModal'
import Landing from '@/components/Landing/Landing'
import { PL_REPO_ID } from '@/helpers/constants'
import { trackGoogleAnalyticsEvent, trackGoogleAnalyticsPageView } from '@/helpers/google-analytics'
import { useGlobalStore } from '@/stores/globalStore'

import MainContent from './components/MainContent'
import NewRepoModal from './components/NewRepoModal'
import Sidebar from './components/Sidebar'
import { useFetchUserRepos } from './hooks/useFetchUserRepos'

export default function Home() {
  const [authState] = useGlobalStore((state) => [state.authState])
  const { initFetchUserRepos, fetchUserReposStatus, userRepos } = useFetchUserRepos()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] = React.useState(false)
  const { connect } = useConnection()
  const navigate = useNavigate()
  const strategy = React.useMemo(() => localStorage.getItem('wallet_kit_strategy_id'), [authState.isLoggedIn])

  React.useEffect(() => {
    if (strategy) {
      trackGoogleAnalyticsPageView('pageview', '/', 'Home Page Visit')
    }
  }, [strategy])

  React.useEffect(() => {
    if (authState.isLoggedIn) {
      initFetchUserRepos()
    }
  }, [authState.isLoggedIn])

  async function handleNewRepoBtnClick() {
    if (!authState.isLoggedIn) {
      connect()
    } else {
      setIsOpen(true)
    }

    trackGoogleAnalyticsEvent('Repository', 'Create Repository button click', 'Create new repo')
  }

  async function handleImportButton() {
    toast.success('This feature is coming soon.')
    trackGoogleAnalyticsEvent('Repository', 'Import Repository button click', 'Import new repo')
  }

  async function handleInstallButtonClick() {
    const NPM_URL = 'https://www.npmjs.com/package/@protocol.land/git-remote-helper'

    trackGoogleAnalyticsEvent('CLI', 'Install Git remote CLI button click', 'Git CLI')

    window.open(NPM_URL, '_blank')
  }

  function handleExploreClick() {
    navigate(`/repository/${PL_REPO_ID}`)
  }

  if (!strategy) {
    return <Landing />
  }

  return (
    <div className="h-full flex flex-1">
      <Sidebar repos={userRepos} isLoading={fetchUserReposStatus === 'PENDING'} />
      <MainContent>
        <div className="w-[70%] lg:w-[85%] xl:w-[80%] 2xl:w-[70%] py-8 flex flex-col gap-8">
          <div
            className={
              'bg-primary-100 p-6 h-[300px] flex flex-col items-center gap-10 justify-center rounded-2xl border-[1px] border-primary-200'
            }
          >
            <h1 className="text-primary-600 text-4xl text-center font-bold">
              Game changing decentralized <br />
              code collaboration
            </h1>
            <Button onClick={handleExploreClick} className="font-medium" variant="primary-solid">
              Explore
            </Button>
          </div>
          <div className="flex gap-4 w-full">
            <div
              className={
                'bg-primary-100 p-6 min-h-[200px] w-full flex flex-col items-center gap-4 justify-center rounded-2xl border-[1px] border-primary-200'
              }
            >
              <div className="flex flex-col text-center gap-2">
                <h1 className="text-2xl font-bold tracking-wide text-primary-600">Create a new repository</h1>
                <p className="text-base font-medium text-primary-500">
                  Start a new project from scratch, invite collaborators and get rolling within seconds.
                </p>
              </div>
              <Button onClick={handleNewRepoBtnClick} variant="primary-solid">
                Create Repository
              </Button>
            </div>
            <div
              className={
                'bg-primary-100 p-6 min-h-[200px] w-full flex flex-col items-center gap-4 justify-center rounded-xl'
              }
            >
              <div className="flex flex-col text-center text-[whitesmoke] gap-2">
                <h1 className="text-2xl font-bold tracking-wide text-primary-600">Import an existing repository</h1>
                <p className="text-base font-medium text-primary-500">
                  Bring your existing repository from Github, Gitlab etc. and continue where you left off.
                </p>
              </div>
              <Button onClick={handleImportButton} variant="primary-solid">
                Import Repository
              </Button>
            </div>
          </div>
          <div className="flex w-full bg-primary-100 p-6  flex-col items-center gap-4 justify-center rounded-xl">
            <div className="flex flex-col text-center text-[whitesmoke] gap-2">
              <h1 className="text-2xl font-bold tracking-wide text-primary-600">Keep your current git workflow</h1>
              <p className="text-base font-medium text-primary-500">
                Install the Protocol.Land git remote helper, add your Protocol.Land repo as a remote and keep your
                regular git workflow!
              </p>
            </div>
            <Button variant="primary-solid" onClick={handleInstallButtonClick}>
              Install
            </Button>
          </div>
        </div>
      </MainContent>
      <NewRepoModal isOpen={isOpen} setIsOpen={setIsOpen} />
      <CreateProfileModal isOpen={isCreateProfileModalOpen} setIsOpen={setIsCreateProfileModalOpen} />
    </div>
  )
}
