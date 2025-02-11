import OverviewTab from '../components/overview/Overview'
import PeopleTab from '../components/people/People'
import RepositoriesTab from '../components/repositories/Repositories'
import SettingsTab from '../components/settings/Settings'

export const rootTabConfig = [
  {
    title: 'Overview',
    Component: OverviewTab,
    getPath: (id: string) => `/organization/${id}`
  },
  {
    title: 'Repositories',
    Component: RepositoriesTab,
    getPath: (id: string) => `/organization/${id}/repositories`
  },
  {
    title: 'People',
    Component: PeopleTab,
    getPath: (id: string) => `/organization/${id}/people`
  },
  {
    title: 'Settings',
    Component: SettingsTab,
    getPath: (id: string) => `/organization/${id}/settings`
  }
]
