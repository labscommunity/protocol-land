import '@xyflow/react/dist/base.css'

import { addEdge, ReactFlow, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react'
import React from 'react'
import { useCallback } from 'react'

import { useGlobalStore } from '@/stores/globalStore'

import { CustomNode } from './CustomNode'

const nodeTypes = {
  custom: CustomNode
}

export default function RepoTreeMap() {
  const reactFlow = useReactFlow()
  const [repoHierarchy, fetchRepoHierarchy] = useGlobalStore((state) => [
    state.repoCoreState.selectedRepo.repoHierarchy,
    state.repoCoreActions.fetchRepoHierarchy
  ])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, _, onNodesChange] = useNodesState(repoHierarchy.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(repoHierarchy.edges)
  const onConnect = useCallback((params: any) => setEdges((els) => addEdge(params, els)), [])
  React.useEffect(() => {
    reactFlow.setViewport({ x: 10, y: 200, zoom: 0.7 })
  }, [reactFlow])

  React.useEffect(() => {
    fetchRepoHierarchy()
  }, [])
  
  return (
    <>
      <ReactFlow
        nodeTypes={nodeTypes}
        className="!w-full !h-full flex flex-col flex-1"
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      />
    </>
  )
}
