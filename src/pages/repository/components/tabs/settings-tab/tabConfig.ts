import Contributors from './Contributors'
import Deployments from './Deployments'
import General from './General'
import GithubSync from './GithubSync'
import Insights from './Insights'

export const tabConfig = [
  {
    title: 'General',
    Component: General
  },
  {
    title: 'Contributors',
    Component: Contributors
  },
  {
    title: 'Insights',
    Component: Insights
  },
  {
    title: 'Deployments',
    Component: Deployments
  },
  {
    title: 'Github Sync',
    Component: GithubSync
  }
]
