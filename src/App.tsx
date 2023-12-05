import { Toaster } from 'react-hot-toast'
import { HashRouter, Route, Routes } from 'react-router-dom'

import AppLayout from './layouts/AppLayout'
import Home from './pages/home/Home'
import { CreateIssuePage, ReadIssuePage } from './pages/issue'
import Profile from './pages/profile/Profile'
import { NewPullRequest, ReadPullRequest } from './pages/pull'
import Repository from './pages/repository/Repository'
import RepositoryWrapper from './pages/repository/RepositoryWrapper'

const repositoryRoutes = [
  { path: '/repository/:id/:tabName?/*?', element: <Repository /> },
  { path: '/repository/:id/pull/new', element: <NewPullRequest /> },
  { path: '/repository/:id/pull/:pullId', element: <ReadPullRequest /> },
  { path: '/repository/:id/issue/new', element: <CreateIssuePage /> },
  { path: '/repository/:id/issue/:issueId', element: <ReadIssuePage /> }
]

function App() {
  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route index path="/user/:id" element={<Profile />} />
          {repositoryRoutes.map(({ path, element }, index) => (
            <Route key={index} path={path} element={<RepositoryWrapper element={element} />} />
          ))}
        </Routes>
      </AppLayout>
      <Toaster position="bottom-center" />
    </HashRouter>
  )
}

export default App
