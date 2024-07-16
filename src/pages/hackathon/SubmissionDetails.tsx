import React from 'react'
import toast from 'react-hot-toast'
import { FaArrowLeft } from 'react-icons/fa'
import { FaClipboard } from 'react-icons/fa'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

import WinnerModal from './components/WinnerModal'

export default function SubmissionDetails() {
  const { address } = useParams()
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const [selectedHackathon, loggedInUserAddress] = useGlobalStore((state) => [state.hackathonState.selectedHackathon, state.authState.address])

  React.useEffect(() => {
    if (!selectedHackathon) goBack()
  }, [selectedHackathon])

  const navigate = useNavigate()

  function goBack() {
    if (!selectedHackathon) return
    navigate(`/hackathon/${selectedHackathon.id}`)
  }

  const submission = selectedHackathon?.submissions[address!]

  if (!submission || !selectedHackathon) return <Navigate to={`/hackathon`} />

  function strToArray(str: string) {
    return str.split(',').map((s) => s.trim())
  }

  function handleCopyLinkToClipBoard(link: string) {
    navigator.clipboard.writeText(link)
    toast.success('Copied to clipboard!')
  }
  const isHackathonOwner = address && selectedHackathon ? selectedHackathon.createdBy === loggedInUserAddress : false
  const hasHackathonEnded = selectedHackathon ? selectedHackathon.endsAt * 1000 < Date.now() : false

  return (
    <div className="h-full flex-1 flex flex-col max-w-[960px] px-8 mx-auto w-full my-6 gap-8">
      <div className="flex relative justify-between items-center">
        <Button onClick={goBack} variant="primary-solid" className="cursor-pointer z-40">
          <FaArrowLeft className="h-4 w-4 text-white" />
        </Button>
        <div className="absolute w-full flex items-center justify-center h-full z-10">
          <h1 className="text-2xl font-medium text-gray-900">{submission.projectName}</h1>
        </div>
        {hasHackathonEnded && isHackathonOwner && (
          <div className="flex z-10">
            <Button onClick={() => setIsModalOpen(true)} className="cursor pointer" variant="primary-solid">
              Select Winner
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 relative">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-gray-900">Project Name</h2>
          <p className="text-gray-800 text-lg">{submission.projectName}</p>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-gray-900">Short Description</h2>
          <p className="text-gray-800 text-lg">{submission.shortDescription}</p>
        </div>
        <div className="absolute right-0">
          <img
            onError={({ currentTarget }) => {
              currentTarget.onerror = null // prevents looping
              currentTarget.src = 'https://placehold.co/500x500?text=LOGO'
            }}
            src={`${submission.logo}`}
            className="w-24 h-24 rounded-full"
          />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-gray-900">Technologies Used</h2>
          <div className="flex gap-2">
            {strToArray(submission.technologiesUsed).map((tag) => (
              <div className="flex px-4 py-[1px] items-center bg-primary-600 rounded-full text-white">{tag}</div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-gray-9000">Links</h2>
          <div className="gap-2  flex flex-col">
            {submission.links.map((link) => (
              <div className="relative justify-center flex flex-col ">
                <input
                  type="text"
                  className={
                    'bg-white border-[1px] text-gray-900 border-gray-300 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none'
                  }
                  value={link}
                  disabled
                  readOnly
                />
                <FaClipboard
                  onClick={() => handleCopyLinkToClipBoard(link)}
                  className="w-5 h-5 cursor-pointer text-primary-600 absolute right-3"
                />
              </div>
            ))}
          </div>
        </div>
        {submission.video && (
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium text-gray-900">Video</h2>
            <div className="flex gap-2">
              <div className="relative justify-center flex flex-col ">
                <input
                  type="text"
                  className={
                    'bg-white border-[1px] text-gray-900 border-gray-300 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none'
                  }
                  value={submission.video}
                  disabled
                  readOnly
                />
                <FaClipboard
                  onClick={() => handleCopyLinkToClipBoard(submission.video)}
                  className="w-5 h-5 cursor-pointer text-primary-600 absolute right-3"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <WinnerModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} participantAddress={submission.submittedBy} />
    </div>
  )
}
