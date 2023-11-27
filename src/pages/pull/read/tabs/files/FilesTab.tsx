import { useGlobalStore } from '@/stores/globalStore'

import FileCompareComponent from './FileCompareComponent'

export default function FilesTab() {
  const [fileStatuses, baseBranchOid, compareBranch, repo] = useGlobalStore((state) => [
    state.pullRequestState.fileStatuses,
    state.pullRequestState.baseBranchOid,
    state.pullRequestState.compareBranch,
    state.repoCoreState.selectedRepo.repo
  ])

  return (
    <div className="h-full w-full px-2 py-2 flex flex-col ">
      {fileStatuses.map((fileStatus) => (
        <FileCompareComponent
          repoName={repo!.name || ''}
          repoId={repo!.id}
          fileStatus={fileStatus}
          base={baseBranchOid}
          compare={compareBranch}
        />
      ))}
    </div>
  )
}
