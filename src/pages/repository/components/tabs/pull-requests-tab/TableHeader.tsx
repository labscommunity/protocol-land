import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { useGlobalStore } from '@/stores/globalStore'

type Props = {
  view: 'OPEN' | 'CLOSED'
  setView: (view: 'OPEN' | 'CLOSED') => void
  openCount: number
  closedCount: number
}

export default function TableHeader({ view, setView, openCount, closedCount }: Props) {
  const [isContributor] = useGlobalStore((state) => [state.repoCoreActions.isContributor])
  const navigate = useNavigate()
  const { id } = useParams()

  function handleNewPRButtonClick() {
    if (id) {
      navigate(`/repository/${id}/pull/new`)
    }
  }

  const contributor = isContributor()

  return (
    <div className="rounded-t-lg flex justify-between bg-gray-200 border-b-[1px] border-gray-300 items-center gap-2 py-2 px-4">
      <div className="flex items-center gap-1">
        <span
          onClick={() => setView('OPEN')}
          className={`flex items-center gap-2 font-medium hover:text-white px-4 py-1 text-gray-900 rounded-lg hover:bg-primary-600 cursor-pointer ${
            view === 'OPEN' ? 'bg-primary-700 text-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)]' : ''
          }`}
        >
          {openCount} Open
        </span>
        <span
          className={`font-medium px-4 py-1 rounded-lg hover:text-white text-gray-900 hover:bg-primary-600 cursor-pointer ${
            view === 'CLOSED' ? 'bg-primary-700 text-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)]' : ''
          }`}
          onClick={() => setView('CLOSED')}
        >
         {closedCount} Closed
        </span>
      </div>
      {contributor && (
        <div
          onClick={handleNewPRButtonClick}
          className="hover:bg-primary-50 active:bg-primary-100 active:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.05)] cursor-pointer flex items-center border-[1.5px] border-primary-600 bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] rounded-lg gap-1 text-primary-700 font-medium px-4 py-1"
        >
          <span>New pull request</span>
        </div>
      )}
    </div>
  )
}
