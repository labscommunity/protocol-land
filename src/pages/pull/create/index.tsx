import { useEffect, useState } from 'react'
import { BiGitCompare } from 'react-icons/bi'
import { FaArrowLeft } from 'react-icons/fa'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import PageNotFound from '@/components/PageNotFound'
import { trackGoogleAnalyticsPageView } from '@/helpers/google-analytics'
import { useGlobalStore } from '@/stores/globalStore'
import { Repo } from '@/types/repository'

import BranchDropdown from './components/BranchDropdown'
import BranchLoading from './components/BranchLoading'
import CommitsDiff from './components/CommitsDiff'
import CommitsDiffLoading from './components/CommitsDiffLoading'
import NewPRForm from './components/NewPRForm'
import RepoDropdown from './components/RepoDropdown'

export default function CreatePullRequest() {
  const [repoList, setRepoList] = useState<{
    base: Repo[]
    compare: Repo[]
  }>({ base: [], compare: [] })
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [
    selectedRepo,
    parentRepo,
    branchList,
    status,
    baseRepo,
    compareRepo,
    baseBranch,
    compareBranch,
    commits,
    fetchAndLoadRepository,
    setDefaultBranches,
    setBaseBranch,
    setCompareBranch,
    setBaseRepo,
    setCompareRepo,
    compareBranches,
    branchState,
    reset
  ] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo,
    state.repoCoreState.parentRepo,
    state.branchState.branchList,
    state.pullRequestState.status,
    state.pullRequestState.baseRepo,
    state.pullRequestState.compareRepo,
    state.pullRequestState.baseBranch,
    state.pullRequestState.compareBranch,
    state.pullRequestState.commits,
    state.repoCoreActions.fetchAndLoadRepository,
    state.pullRequestActions.setDefaultBranches,
    state.pullRequestActions.setBaseBranch,
    state.pullRequestActions.setCompareBranch,
    state.pullRequestActions.setBaseRepo,
    state.pullRequestActions.setCompareRepo,
    state.pullRequestActions.compareBranches,
    state.branchState,
    state.repoCoreActions.reset
  ])

  useEffect(() => {
    if (id) {
      fetchAndLoadRepository(id, branchState.currentBranch)
    }

    return () => {
      reset()
    }
  }, [id])

  useEffect(() => {
    if (selectedRepo.repo) {
      setDefaultBranches()

      prepareAndSetRepoList()

      trackGoogleAnalyticsPageView('pageview', location.pathname, 'Create Pull Request Page Visit', {
        repo_name: selectedRepo.repo.name,
        repo_id: selectedRepo.repo.id
      })
    }
  }, [selectedRepo])

  useEffect(() => {
    if (baseBranch && compareBranch && baseRepo && compareRepo) {
      const params = {
        base: {
          repoName: baseRepo.name,
          branch: baseBranch,
          id: baseRepo.id
        },
        compare: {
          repoName: compareRepo.name,
          branch: compareBranch,
          id: compareRepo.id
        }
      }

      compareBranches(params)
    }
  }, [baseBranch, compareBranch, baseRepo, compareRepo])

  function goBack() {
    navigate(-1)
  }

  function prepareAndSetRepoList() {
    if (selectedRepo.repo) {
      const selectedRepoObj = selectedRepo.repo

      const payload = {
        base: [selectedRepoObj],
        compare: [selectedRepoObj]
      }

      if (selectedRepoObj.fork && parentRepo.repo) {
        const parentRepoObj = parentRepo.repo

        payload.base.push(parentRepoObj)
      }

      setRepoList(payload)
    }
  }

  const isDiffReady = status === 'SUCCESS' && selectedRepo.status === 'SUCCESS'
  const isBranchReady = baseBranch && compareBranch

  if (selectedRepo.status === 'ERROR') {
    return <PageNotFound />
  }

  return (
    <div className="h-full flex-1 flex flex-col max-w-[1200px] mx-auto w-full mt-6 gap-8">
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
            <div className="flex gap-4">
              <RepoDropdown label="Repo" items={repoList.base} selectedItem={baseRepo!} setSelectedItem={setBaseRepo} />
              <BranchDropdown
                label="Base"
                items={branchList}
                selectedItem={baseBranch}
                setSelectedItem={setBaseBranch}
              />
            </div>
            <div className="h-full flex items-center">
              <BiGitCompare className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex gap-4">
              <RepoDropdown
                label="Repo"
                items={repoList.compare}
                selectedItem={compareRepo!}
                setSelectedItem={setCompareRepo}
                disabled
              />
              <BranchDropdown
                label="Compare"
                items={branchList}
                selectedItem={compareBranch}
                setSelectedItem={setCompareBranch}
              />
            </div>
          </div>
        )}
      </div>
      {!isDiffReady && <CommitsDiffLoading />}
      {isDiffReady && commits.length > 0 && (
        <NewPRForm
          baseRepo={baseRepo}
          compareRepo={compareRepo}
          repoId={baseRepo?.id || ''}
          baseBranch={baseBranch}
          compareBranch={compareBranch}
        />
      )}
      {isDiffReady && <CommitsDiff commits={commits} />}
    </div>
  )
}
