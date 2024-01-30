import { LuGitPullRequest } from 'react-icons/lu'
import { TbMoneybag } from 'react-icons/tb'
import { VscCommentDiscussion } from 'react-icons/vsc'

import BountyTab from '../tabs/bounty'
import OverviewTab from '../tabs/overview/OverviewTab'
import PullRequestsTab from '../tabs/pullrequests/PullRequestsTab'

export const rootTabConfig = [
  {
    title: 'Overview',
    Component: OverviewTab,
    Icon: VscCommentDiscussion
  },
  {
    title: 'Bounties',
    Component: BountyTab,
    Icon: TbMoneybag
  },
  {
    title: 'Linked Pull Requests',
    Component: PullRequestsTab,
    Icon: LuGitPullRequest
  }
]
