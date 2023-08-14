import { HashRouter, Route, Routes } from 'react-router-dom'

import AppLayout from './layouts/AppLayout'
import Home from './pages/home/Home'
import Repository from './pages/repository/Repository'

function App() {
  return (
    <AppLayout>
      <HashRouter>
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/repository/:txid" element={<Repository />} />
        </Routes>
      </HashRouter>
    </AppLayout>
  )
}

export default App
