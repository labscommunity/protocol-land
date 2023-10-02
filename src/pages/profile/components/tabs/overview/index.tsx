import { User } from '@/types/user'

import ReadMe from './components/ReadMe'

export default function OverviewTab({ userDetails }: { userDetails: User }) {
  return (
    <div className="flex flex-col w-full">
      <ReadMe readmeTxId={userDetails.readmeTxId || ''} />
    </div>
  )
}
