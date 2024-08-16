import '@xyflow/react/dist/base.css'

import { ReactFlowProvider } from '@xyflow/react'

import { useGlobalStore } from '@/stores/globalStore'

import RepoTreeMap from './RepoTreeMap'

export default function ForksTab() {
  const [userRepo] = useGlobalStore((state) => [state.repoCoreState.selectedRepo.repo])
  const forks = userRepo?.forks ?? {}

  return (
    <div className="h-full px-2 flex flex-col w-full flex-1">
      <ReactFlowProvider>
        <RepoTreeMap />
      </ReactFlowProvider>
    </div>
  )
}
