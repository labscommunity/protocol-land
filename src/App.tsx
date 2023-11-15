import { Toaster } from 'react-hot-toast'
import { HashRouter, Route, Routes } from 'react-router-dom'

import AppLayout from './layouts/AppLayout'
import Home from './pages/home/Home'
import { CreateIssuePage, ReadIssuePage } from './pages/issue'
import Profile from './pages/profile/Profile'
import { NewPullRequest, ReadPullRequest } from './pages/pull'
import Repository from './pages/repository/Repository'

function App() {
  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route index path="/user/:id" element={<Profile />} />
          <Route path="/repository/:id/:tabName?" element={<Repository />} />
          <Route path="/repository/:id/pull/new" element={<NewPullRequest />} />
          <Route path="/repository/:id/pull/:pullId" element={<ReadPullRequest />} />
          <Route path="/repository/:id/issue/new" element={<CreateIssuePage />} />
          <Route path="/repository/:id/issue/:issueId" element={<ReadIssuePage />} />
        </Routes>
      </AppLayout>
      <Toaster position="bottom-center" />
    </HashRouter>
  )
}

export default App
