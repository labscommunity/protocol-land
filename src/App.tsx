import { Toaster } from 'react-hot-toast'
import { HashRouter, Route, Routes } from 'react-router-dom'

import AppLayout from './layouts/AppLayout'
import Article from './pages/blog/Article'
import Blog from './pages/blog/BlogList'
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
      <Routes>
        <Route index path="/" element={<AppLayout Component={Home} />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Article />} />
        <Route path="/user/:id" element={<AppLayout Component={Profile} />} />
        {repositoryRoutes.map(({ path, element }, index) => (
          <Route
            key={index}
            path={path}
            element={<AppLayout Component={() => <RepositoryWrapper element={element} />} />}
          />
        ))}
      </Routes>

      <Toaster position="bottom-center" />
    </HashRouter>
  )
}

export default App
