import { RiBookOpenFill, RiGitRepositoryFill } from 'react-icons/ri'

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
  }
]
