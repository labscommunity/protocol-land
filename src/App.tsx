import { Toaster } from 'react-hot-toast'
import { HashRouter, Route, Routes } from 'react-router-dom'

import OrgRepoWrapper from './components/OrgRepoWrapper'
import AppLayout from './layouts/AppLayout'
import Article from './pages/blog/Article'
import Blog from './pages/blog/BlogList'
import CreateHackathon from './pages/hackathon/CreateHackathon'
import Hackathon from './pages/hackathon/Hackathon'
import HackathonDetails from './pages/hackathon/HackathonDetails'
import HackathonParticipate from './pages/hackathon/HackathonParticipate'
import SubmissionDetails from './pages/hackathon/SubmissionDetails'
import SubmitHackathon from './pages/hackathon/SubmitHackathon'
import Home from './pages/home/Home'
import { CreateIssuePage, ReadIssuePage } from './pages/issue'
import OrganizationPage from './pages/organization/Organization'
import Profile from './pages/profile/Profile'
import { NewPullRequest, ReadPullRequest } from './pages/pull'
import Repository from './pages/repository/Repository'

const repositoryRoutes = [
  { path: '/repository/:id/:tabName?/*?', element: <Repository /> },
  { path: '/repository/:id/pull/new', element: <NewPullRequest /> },
  { path: '/repository/:id/pull/:pullId', element: <ReadPullRequest /> },
  { path: '/repository/:id/issue/new', element: <CreateIssuePage /> },
  { path: '/repository/:id/issue/:issueId', element: <ReadIssuePage /> }
]

const organizationRoutes = [{ path: '/organization/:id/:tabName?', element: <OrganizationPage /> }]

const hackathonRoutes = [
  { path: '/hackathon', element: <Hackathon /> },
  { path: '/hackathon/create', element: <CreateHackathon /> },
  { path: '/hackathon/:id/:tabName?', element: <HackathonDetails /> },
  { path: '/hackathon/:id/submit', element: <SubmitHackathon /> },
  { path: '/hackathon/:id/participate', element: <HackathonParticipate /> },
  { path: '/hackathon/:id/submission/:address', element: <SubmissionDetails /> }
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
            element={<AppLayout Component={() => <OrgRepoWrapper element={element} />} />}
          />
        ))}
        {hackathonRoutes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={<AppLayout Component={() => element} />} />
        ))}
        {organizationRoutes.map(({ path, element }, index) => (
          <Route
            key={index}
            path={path}
            element={<AppLayout Component={() => <OrgRepoWrapper element={element} />} />}
          />
        ))}
      </Routes>

      <Toaster position="bottom-center" />
    </HashRouter>
  )
}

export default App
