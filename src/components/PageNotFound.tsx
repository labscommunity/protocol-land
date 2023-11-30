import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/common/buttons'

export default function PageNotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex justify-center h-screen">
      <div className="text-center mt-[20vh]">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
        <p className="text-gray-500">Sorry, the page you are looking for does not exist.</p>
        <div className="flex justify-center mt-3">
          <Button variant="primary-outline" onClick={() => navigate(`/`)}>
            Goto Home
          </Button>
        </div>
      </div>
    </div>
  )
}
