import { BiCodeAlt } from 'react-icons/bi'
import { BsRocketTakeoff } from 'react-icons/bs'
import { FiGitBranch, FiGitCommit, FiGitPullRequest } from 'react-icons/fi'
import { VscIssues } from 'react-icons/vsc'

export const files = [
  { name: 'public', description: 'Bug fixes', date: '12 hours ago', isFolder: true },
  { name: 'scripts', description: 'Bug fixes', date: '12 hours ago', isFolder: true },
  { name: 'src', description: 'Bug fixes', date: '12 hours ago', isFolder: true },
  { name: 'warp/protocol-land', description: 'Bug fixes', date: '12 hours ago', isFolder: true },
  { name: '.gitignore', description: 'Add source files', date: '1 month ago', isFolder: false },
  { name: 'LICENSE.txt', description: 'Add files via upload', date: '10 hours ago', isFolder: false },
  { name: 'README.md', description: 'Update preview', date: '10 hours ago', isFolder: false },
  { name: 'package.json', description: 'Bug fixes', date: '12 hours ago', isFolder: false }
]

export const tabs = [
  {
    title: 'Code',
    Icon: BiCodeAlt,
    getPath: (id: string, branchName?: string) =>
      `/repository/${id}${branchName && branchName !== 'master' ? `/tree/${branchName}` : ''}`
  },
  {
    title: 'Issues',
    Icon: VscIssues,
    getPath: (id: string, _?: string) => `/repository/${id}/issues`
  },
  {
    title: 'Commits',
    Icon: FiGitCommit,
    getPath: (id: string, branchName?: string) => `/repository/${id}/commits${branchName ? `/${branchName}` : ''}`
  },
  {
    title: 'Pull Requests',
    Icon: FiGitPullRequest,
    getPath: (id: string, _?: string) => `/repository/${id}/pulls`
  },
  {
    title: 'Forks',
    Icon: FiGitBranch,
    getPath: (id: string, _?: string) => `/repository/${id}/forks`
  },
  {
    title: 'Deployments',
    Icon: BsRocketTakeoff,
    getPath: (id: string, _?: string) => `/repository/${id}/deployments`
  }
]

export const commit = {
  oid: '9c780bcfa198118c0ad04f959fc3bcbb93fe86b9',
  commit: {
    message: 'Add files via upload',
    author: {
      name: 'Sai Kranthi'
    },
    committer: {
      timestamp: 1704826487
    }
  }
}
