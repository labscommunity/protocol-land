import { HashRouter, Route, Routes } from 'react-router-dom'

import AppLayout from './layouts/AppLayout'
import Home from './pages/home/Home'

function App() {
  return (
    <AppLayout>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </HashRouter>
    </AppLayout>
  )
}

export default App
