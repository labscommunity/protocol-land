import { FiFile, FiGitCommit } from 'react-icons/fi'
import { VscCommentDiscussion } from 'react-icons/vsc'

import CommitsTab from '../tabs/commits/CommitsTab'
import FilesTab from '../tabs/files/FilesTab'
import OverviewTab from '../tabs/overview/OverviewTab'

export const rootTabConfig = [
  {
    title: 'Overview',
    Component: OverviewTab,
    Icon: VscCommentDiscussion
  },
  {
    title: 'Commits',
    Component: CommitsTab,
    Icon: FiGitCommit
  },
  {
    title: 'Files',
    Component: FilesTab,
    Icon: FiFile
  }
]
