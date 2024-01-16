import { FiFile, FiGitCommit } from 'react-icons/fi'
import { VscCommentDiscussion, VscIssues } from 'react-icons/vsc'

import CommitsTab from '../tabs/commits/CommitsTab'
import FilesTab from '../tabs/files/FilesTab'
import IssueTab from '../tabs/issue/IssueTab'
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
  },
  {
    title: 'Linked Issue',
    Component: IssueTab,
    Icon: VscIssues
  }
]
