import { BiCodeAlt } from 'react-icons/bi'
import { FiGitCommit, FiGitPullRequest, FiSettings } from 'react-icons/fi'
import { VscIssues } from 'react-icons/vsc'

import CodeTab from '../components/tabs/code-tab'
import CommitsTab from '../components/tabs/commits-tab'
import IssuesTab from '../components/tabs/issues-tab'
import PullRequestsTab from '../components/tabs/pull-requests-tab'
import SettingsTab from '../components/tabs/settings-tab'

export const rootTabConfig = [
  {
    title: 'Code',
    Component: CodeTab,
    Icon: BiCodeAlt,
    getPath: (id: string) => `/repository/${id}`
  },
  {
    title: 'Issues',
    Component: IssuesTab,
    Icon: VscIssues,
    getPath: (id: string) => `/repository/${id}/issues`
  },
  {
    title: 'Commits',
    Component: CommitsTab,
    Icon: FiGitCommit,
    getPath: (id: string) => `/repository/${id}/commits`
  },
  {
    title: 'Pull Requests',
    Component: PullRequestsTab,
    Icon: FiGitPullRequest,
    getPath: (id: string) => `/repository/${id}/pulls`
  },
  {
    title: 'Settings',
    Component: SettingsTab,
    Icon: FiSettings,
    getPath: (id: string) => `/repository/${id}/settings`
  }
]
