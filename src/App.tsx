import { HashRouter, Route, Routes } from 'react-router-dom'

import AppLayout from './layouts/AppLayout'
import Home from './pages/home/Home'
import Repository from './pages/repository/Repository'

function App() {
  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/repository/:txid" element={<Repository />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  )
}

export default App
