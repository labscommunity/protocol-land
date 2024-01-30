import { Issue, PullRequest } from '@/types/repository'

import Comment from './Comment'

interface DescriptionProps {
  isIssue: boolean
  issueOrPr: Issue | PullRequest
  canEdit: boolean
}

export default function Description({ issueOrPr, canEdit, isIssue }: DescriptionProps) {
  return <Comment isIssue={isIssue} item={issueOrPr} issueOrPRId={issueOrPr.id} canEdit={canEdit} />
}
