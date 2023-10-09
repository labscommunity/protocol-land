import { User } from '@/types/user'

import Contributions from './components/Contributions'
import ReadMe from './components/ReadMe'

export default function OverviewTab({ userDetails }: { userDetails: User }) {
  return (
    <div className="flex flex-col w-full gap-4">
      <ReadMe readmeTxId={userDetails.readmeTxId || ''} />
      <Contributions />
    </div>
  )
}
