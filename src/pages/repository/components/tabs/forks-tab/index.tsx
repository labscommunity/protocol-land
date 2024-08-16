import '@xyflow/react/dist/base.css'

import { ReactFlowProvider } from '@xyflow/react'

import RepoTreeMap from './RepoTreeMap'

export default function ForksTab() {
  return (
    <div className="h-full px-2 flex flex-col w-full flex-1">
      <ReactFlowProvider>
        <RepoTreeMap />
      </ReactFlowProvider>
    </div>
  )
}
