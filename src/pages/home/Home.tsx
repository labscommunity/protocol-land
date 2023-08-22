import React from 'react'

import BottomRightImg from '@/assets/images/bg/banner-bg.svg'
import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

import MainContent from './components/MainContent'
import NewRepoModal from './components/NewRepoModal'
import Sidebar from './components/Sidebar'
import { useFetchUserRepos } from './hooks/useFetchUserRepos'

const style = {
  '--bg-right-btm-img-url': `url(${BottomRightImg})`
} as React.CSSProperties
const afterClasses =
  'after:content-[""] relative after:z-[-1] z-[1] after:bg-[image:var(--bg-right-btm-img-url)] after:bg-cover after:bg-no-repeat after:bg-left-top after:right-0 after:bottom-0 after:absolute after:w-[100%] after:h-[100%] after:opacity-30'

export default function Home() {
  const [isLoggedIn] = useGlobalStore((state) => [state.auth.isLoggedIn])
  const { initFetchUserRepos, fetchUserReposStatus, userRepos } = useFetchUserRepos()
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (isLoggedIn) {
      initFetchUserRepos()
    }
  }, [isLoggedIn])

  async function handleNewRepoBtnClick() {
    setIsOpen(true)
  }
  console.log({ userRepos, fetchUserReposStatus })
  return (
    <div className="h-full flex">
      <Sidebar repos={userRepos} isLoading={fetchUserReposStatus === 'PENDING'} />
      <MainContent>
        <div className="w-[70%] py-8 flex flex-col gap-8">
          <div
            style={style}
            className={
              'bg-[#414E7A] p-6 h-[300px] flex flex-col items-center gap-10 justify-center rounded-xl ' + afterClasses
            }
          >
            <h1 className="text-[whitesmoke] text-6xl text-center font-extralight tracking-wide">
              Game changing decentralized code collaboration
            </h1>
            <Button className="rounded-[20px] opacity-100" variant="solid">
              Explore
            </Button>
          </div>
          <div className="flex gap-4 w-full">
            <div
              className={'bg-[#414E7A] p-6 h-[200px] w-full flex flex-col items-center gap-4 justify-center rounded-xl'}
            >
              <div className="flex flex-col text-center text-[whitesmoke] gap-2">
                <h1 className="text-xl font-medium tracking-wide">Create a new repository</h1>
                <p>Start a new project from scratch, invite collaborators and get rolling within seconds.</p>
              </div>
              <Button onClick={handleNewRepoBtnClick} className="rounded-[20px]" variant="solid">
                Create Repository
              </Button>
            </div>
            <div
              className={'bg-[#414E7A] p-6 h-[200px] w-full flex flex-col items-center gap-4 justify-center rounded-xl'}
            >
              <div className="flex flex-col text-center text-[whitesmoke] gap-2">
                <h1 className="text-xl font-medium tracking-wide">Import an existing repository</h1>
                <p>Bring your existing repository from Github, Gitlab etc. and continue where you left off.</p>
              </div>
              <Button className="rounded-[20px]" variant="solid">
                Import Repository
              </Button>
            </div>
          </div>
        </div>
      </MainContent>
      <NewRepoModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  )
}
