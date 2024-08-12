import Contributors from './Contributors'
import Deployments from './Deployments'
import General from './General'
import GithubSync from './GithubSync'
import Insights from './Insights'
import Token from './Token'

export const tabConfig = [
  {
    title: 'General',
    Component: General,
    getPath: (id: string, _?: string) => `/repository/${id}/settings/general`
  },
  {
    title: 'Token',
    Component: Token,
    getPath: (id: string, _?: string) => `/repository/${id}/settings/token`
  },
  {
    title: 'Contributors',
    Component: Contributors,
    getPath: (id: string, _?: string) => `/repository/${id}/settings/contributors`
  },
  {
    title: 'Insights',
    Component: Insights,
    getPath: (id: string, _?: string) => `/repository/${id}/settings/insights`
  },
  {
    title: 'Deployments',
    Component: Deployments,
    getPath: (id: string, _?: string) => `/repository/${id}/settings/deployments`
  },
  {
    title: 'Github Sync',
    Component: GithubSync,
    getPath: (id: string, _?: string) => `/repository/${id}/settings/github-sync`
  }
]
