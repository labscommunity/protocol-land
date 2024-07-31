import { LuGitPullRequest } from 'react-icons/lu'
import { VscCommentDiscussion } from 'react-icons/vsc'

import OverviewTab from '../tabs/overview/OverviewTab'
import PullRequestsTab from '../tabs/pullrequests/PullRequestsTab'

export const rootTabConfig = [
  {
    title: 'Overview',
    Component: OverviewTab,
    Icon: VscCommentDiscussion
  },
  {
    title: 'Linked Pull Requests',
    Component: PullRequestsTab,
    Icon: LuGitPullRequest
  }
]
