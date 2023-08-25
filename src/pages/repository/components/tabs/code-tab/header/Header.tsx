import AddFilesButton from './AddFilesButton'
import BranchButton from './BranchButton'

export default function Header() {
  return (
    <div className="flex justify-between">
      <BranchButton />
      <AddFilesButton />
    </div>
  )
}
