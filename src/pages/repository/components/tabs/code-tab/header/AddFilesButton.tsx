import React from 'react'
import { AiOutlinePlus } from 'react-icons/ai'

import { Button } from '@/components/common/buttons'

import AddFilesModal from './AddFilesModal'

export default function AddFilesButton() {
  const [isAddFilesModalOpen, setIsAddFilesModalOpen] = React.useState(false)

  return (
    <div className="flex">
      <Button
        onClick={() => setIsAddFilesModalOpen(true)}
        className="rounded-lg flex items-center py-[4px] px-4 font-medium gap-1"
        variant="solid"
      >
        <AiOutlinePlus className="w-5 h-5" /> Add Files
      </Button>
      <AddFilesModal isOpen={isAddFilesModalOpen} setIsOpen={setIsAddFilesModalOpen} />
    </div>
  )
}