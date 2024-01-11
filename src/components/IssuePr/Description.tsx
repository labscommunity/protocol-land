import { Issue, PullRequest } from '@/types/repository'

import Comment from './Comment'

interface DescriptionProps {
  isIssue: boolean
  issueOrPr: Issue | PullRequest
  isContributor: boolean
}

export default function Description({ issueOrPr, isContributor, isIssue }: DescriptionProps) {
  return <Comment isIssue={isIssue} item={issueOrPr} issueOrPRId={issueOrPr.id} isContributor={isContributor} />
}
