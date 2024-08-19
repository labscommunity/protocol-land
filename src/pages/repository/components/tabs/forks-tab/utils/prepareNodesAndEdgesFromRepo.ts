import { Edge, Node, Position } from '@xyflow/react'

import { Repo } from '@/types/repository'

import { TreeNodeData } from '../types'

export function prepareNodesAndEdgesFromRepo(repos: Repo[], selectedRepoId: string) {
  function buildTree(repo: Repo, reposMap: Map<string, Repo>) {
    const node: TreeNode = {
      repo: repo,
      children: []
    }

    if (repo.forks) {
      for (const fork of Object.values(repo.forks)) {
        if (reposMap.has(fork.id)) {
          node.children.push(buildTree(reposMap.get(fork.id)!, reposMap))
        }
      }
    }

    return node
  }

  const reposMap = new Map(repos.map((repo) => [repo.id, repo]))
  const rootRepo = repos.find((repo) => !repo.parent)
  const tree = rootRepo ? [buildTree(rootRepo, reposMap)] : []

  const edges: Edge[] = []
  const nodes: Node[] = []
  const positionMap = new Map<string, { x: number; y: number }>()

  function traverseTree(node: TreeNode, parentNode: Node | null, depth: number, siblingIndex: number) {
    const x = parentNode ? parentNode.position.x + 500 : 0
    const y = parentNode ? parentNode.position.y + siblingIndex * 200 : 0

    const newNode = {
      id: node.repo.id,
      type: 'custom',
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: node.repo,
      position: { x, y }
    }

    if (!parentNode) {
      ;(newNode.data as TreeNodeData).origin = true
      ;(newNode.data as TreeNodeData).primary = true
    }

    if (node.repo.id === selectedRepoId) {
      ;(newNode.data as TreeNodeData).isCurrentRepo = true
    }

    nodes.push(newNode)
    positionMap.set(node.repo.id, { x, y })

    if (parentNode) {
      edges.push({
        id: `e${parentNode.id}-${node.repo.id}`,
        source: parentNode.id,
        target: node.repo.id
      })
    }

    node.children.forEach((child, index) => {
      traverseTree(child, newNode, depth + 1, index)
    })
  }

  tree.forEach((rootNode, index) => {
    traverseTree(rootNode, null, 0, index)
  })

  return { nodes, edges }
}

type TreeNode = {
  repo: Repo
  children: TreeNode[]
}
