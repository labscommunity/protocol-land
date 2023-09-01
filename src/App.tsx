import { HashRouter, Route, Routes } from 'react-router-dom'

import AppLayout from './layouts/AppLayout'
import Home from './pages/home/Home'
import { NewPullRequest, ReadPullRequest } from './pages/pull'
import Repository from './pages/repository/Repository'

function App() {
  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/repository/:id" element={<Repository />} />
          <Route path="/repository/:id/pull/new" element={<NewPullRequest />} />
          <Route path="/repository/:id/pull/:pullId" element={<ReadPullRequest />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  )
}

export default App
