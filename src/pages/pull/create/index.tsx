import { useEffect } from 'react'
import { BiGitCompare } from 'react-icons/bi'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

import BranchDropdown from './components/BranchDropdown'
import BranchLoading from './components/BranchLoading'
import CommitsDiff from './components/CommitsDiff'
import CommitsDiffLoading from './components/CommitsDiffLoading'
import NewPRForm from './components/NewPRForm'

export default function CreatePullRequest() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [
    selectedRepo,
    branchList,
    status,
    baseBranch,
    compareBranch,
    commits,
    fetchAndLoadRepository,
    setDefaultBranches,
    setBaseBranch,
    setCompareBranch,
    compareBranches
  ] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo,
    state.branchState.branchList,
    state.pullRequestState.status,
    state.pullRequestState.baseBranch,
    state.pullRequestState.compareBranch,
    state.pullRequestState.commits,
    state.repoCoreActions.fetchAndLoadRepository,
    state.pullRequestActions.setDefaultBranches,
    state.pullRequestActions.setBaseBranch,
    state.pullRequestActions.setCompareBranch,
    state.pullRequestActions.compareBranches
  ])

  useEffect(() => {
    if (id) {
      fetchAndLoadRepository(id)
    }
  }, [id])

  useEffect(() => {
    if (selectedRepo.repo) {
      setDefaultBranches()
    }
  }, [selectedRepo])

  useEffect(() => {
    if (baseBranch && compareBranch) {
      compareBranches(baseBranch, compareBranch)
    }
  }, [baseBranch, compareBranch])

  function goBack() {
    navigate(-1)
  }

  const isDiffReady = status === 'SUCCESS' && selectedRepo.status === 'SUCCESS'
  const isBranchReady = baseBranch && compareBranch

  return (
    <div className="h-full flex-1 flex flex-col max-w-[800px] mx-auto w-full mt-6 gap-8">
      <div className="flex flex-col gap-4">
        <div>
          <Button onClick={goBack} variant="primary-solid">
            <FaArrowLeft className="h-4 w-4 text-white" />
          </Button>
        </div>
        <div className="flex flex-col gap-1 border-b-[1px] border-gray-200 pb-2 text-gray-900">
          <h1 className="text-3xl ">Create a new pull request</h1>
          <p className="text-lg text-gray-500">
            Choose two branches to see what's changed and start a new pull request.
          </p>
        </div>
        {!isBranchReady && <BranchLoading />}
        {isBranchReady && (
          <div className="flex gap-10 items-center justify-center py-8 bg-primary-100 border-[1px] border-gray-300 rounded-md">
            <BranchDropdown label="Base" items={branchList} selectedItem={baseBranch} setSelectedItem={setBaseBranch} />
            <div className="h-full flex items-center">
              <BiGitCompare className="w-6 h-6 text-gray-600" />
            </div>
            <BranchDropdown
              label="Compare"
              items={branchList}
              selectedItem={compareBranch}
              setSelectedItem={setCompareBranch}
            />
          </div>
        )}
      </div>
      {!isDiffReady && <CommitsDiffLoading />}
      {isDiffReady && commits.length > 0 && (
        <NewPRForm repoName={selectedRepo.repo?.name || ''} baseBranch={baseBranch} compareBranch={compareBranch} />
      )}
      {isDiffReady && <CommitsDiff commits={commits} />}
    </div>
  )
}
