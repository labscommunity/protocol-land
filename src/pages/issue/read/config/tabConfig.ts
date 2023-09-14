import { TbMoneybag } from 'react-icons/tb'
import { VscCommentDiscussion } from 'react-icons/vsc'

import BountyTab from '../tabs/bounty/BountyTab'
import OverviewTab from '../tabs/overview/OverviewTab'

export const rootTabConfig = [
  {
    title: 'Overview',
    Component: OverviewTab,
    Icon: VscCommentDiscussion
  },
  {
    title: 'Bounty',
    Component: BountyTab,
    Icon: TbMoneybag
  }
]
