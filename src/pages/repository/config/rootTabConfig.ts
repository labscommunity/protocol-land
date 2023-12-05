import { BiCodeAlt } from 'react-icons/bi'
import { FiGitBranch, FiGitCommit, FiGitPullRequest, FiSettings } from 'react-icons/fi'
import { VscIssues } from 'react-icons/vsc'

import CodeTab from '../components/tabs/code-tab'
import CommitsTab from '../components/tabs/commits-tab'
import ForksTab from '../components/tabs/forks-tab'
import IssuesTab from '../components/tabs/issues-tab'
import PullRequestsTab from '../components/tabs/pull-requests-tab'
import SettingsTab from '../components/tabs/settings-tab'

export const rootTabConfig = [
  {
    title: 'Code',
    Component: CodeTab,
    Icon: BiCodeAlt,
    getPath: (id: string, branchName?: string) =>
      `/repository/${id}${branchName && branchName !== 'master' ? `/tree/${branchName}` : ''}`
  },
  {
    title: 'Issues',
    Component: IssuesTab,
    Icon: VscIssues,
    getPath: (id: string, _?: string) => `/repository/${id}/issues`
  },
  {
    title: 'Commits',
    Component: CommitsTab,
    Icon: FiGitCommit,
    getPath: (id: string, branchName?: string) => `/repository/${id}/commits${branchName ? `/${branchName}` : ''}`
  },
  {
    title: 'Pull Requests',
    Component: PullRequestsTab,
    Icon: FiGitPullRequest,
    getPath: (id: string, _?: string) => `/repository/${id}/pulls`
  },
  {
    title: 'Forks',
    Component: ForksTab,
    Icon: FiGitBranch,
    getPath: (id: string, _?: string) => `/repository/${id}/forks`
  },
  {
    title: 'Settings',
    Component: SettingsTab,
    Icon: FiSettings,
    getPath: (id: string, _?: string) => `/repository/${id}/settings`
  }
]
