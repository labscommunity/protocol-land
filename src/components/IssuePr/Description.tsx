import { Issue, PullRequest } from '@/types/repository'

import Comment from './Comment'

export default function Description({ issueOrPr }: { issueOrPr: Issue | PullRequest }) {
  if (!issueOrPr) return null

  const isIssue = 'assignees' in issueOrPr

  return <Comment isIssue={isIssue} item={issueOrPr} issueOrPRId={issueOrPr.id} />
}
