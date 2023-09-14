import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { useGlobalStore } from '@/stores/globalStore'

type Props = {
  view: 'OPEN' | 'CLOSED'
  setView: (view: 'OPEN' | 'CLOSED') => void
}

export default function TableHeader({ view, setView }: Props) {
  const [isContributor] = useGlobalStore((state) => [state.repoCoreActions.isContributor])
  const navigate = useNavigate()
  const { id } = useParams()

  function handleNewIssueButtonClick() {
    if (id) {
      navigate(`/repository/${id}/issue/new`)
    }
  }

  const contributor = isContributor()

  return (
    <div className="rounded-t-lg flex justify-between bg-liberty-light-800 text-[whitesmoke] items-center gap-2 py-2 px-4">
      <div className="flex items-center gap-1">
        <span
          onClick={() => setView('OPEN')}
          className={`font-medium px-4 py-1 rounded-full hover:bg-[#4487F5] cursor-pointer ${
            view === 'OPEN' ? 'bg-[#4487F5]' : ''
          }`}
        >
          Open
        </span>
        <span
          className={`font-medium px-4 py-1 rounded-full hover:bg-[#4487F5] cursor-pointer ${
            view === 'CLOSED' ? 'bg-[#4487F5]' : ''
          }`}
          onClick={() => setView('CLOSED')}
        >
          Closed
        </span>
      </div>
      {contributor && (
        <div
          onClick={handleNewIssueButtonClick}
          className=" cursor-pointer flex items-center bg-[#38a457] rounded-full gap-1 font-medium px-4 py-1"
        >
          <span className="text-white">New issue</span>
        </div>
      )}
    </div>
  )
}
