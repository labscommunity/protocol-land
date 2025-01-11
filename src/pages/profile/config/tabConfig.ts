import { RiBookOpenFill, RiGitRepositoryFill, RiUserFill } from 'react-icons/ri'

import OrganizationsTab from '../components/tabs/organizations'
import OverviewTab from '../components/tabs/overview'
import RepositoriesTab from '../components/tabs/repositories'

export const rootTabConfig = [
  {
    title: 'Overview',
    Component: OverviewTab,
    Icon: RiBookOpenFill
  },
  {
    title: 'Repositories',
    Component: RepositoriesTab,
    Icon: RiGitRepositoryFill
  },
  {
    title: 'Organizations',
    Component: OrganizationsTab,
    Icon: RiUserFill
  }
]
