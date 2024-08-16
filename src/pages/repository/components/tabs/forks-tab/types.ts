import { Repo } from '@/types/repository'

export interface TreeNodeData extends Repo {
  isCurrentRepo?: boolean
  origin?: boolean
}
