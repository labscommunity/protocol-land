import MDEditor from '@uiw/react-md-editor'
import React from 'react'
import toast from 'react-hot-toast'
import { FaArrowLeft, FaClipboard, FaExternalLinkAlt } from 'react-icons/fa'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { FadeLoader } from 'react-spinners'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

import WinnerModal from './components/WinnerModal'
import { getLogoUrl } from './utils/getLogoUrl'

export default function SubmissionDetails() {
  const { id } = useParams()
  const [detailedDescription, setDetailedDescription] = React.useState('')
  const [isDetailedDescriptionLoading, setIsDetailedDescriptionLoading] = React.useState(false)
  const { address } = useParams()
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const [selectedHackathon, loggedInUserAddress, loadingStatus, fetchHackathonById] = useGlobalStore((state) => [
    state.hackathonState.selectedHackathon,
    state.authState.address,
    state.hackathonState.status,
    state.hackathonActions.fetchHackathonById
  ])

  React.useEffect(() => {
    if (id) {
      fetchHackathonById(id)
    }
  }, [id])

  const navigate = useNavigate()

  function goBack() {
    if (!selectedHackathon) return
    navigate(-1)
  }

  const submission = selectedHackathon?.submissions[address!]

  React.useEffect(() => {
    if (submission && submission?.descriptionTxId) {
      fetchDetails(submission.descriptionTxId)
    }
  }, [submission])

  function strToArray(str: string) {
    return str.split(',').map((s) => s.trim())
  }

  async function fetchDetails(descriptionTxId: string) {
    if (!descriptionTxId) return

    setIsDetailedDescriptionLoading(true)
    try {
      const res = await fetch(`https://arweave.net/${descriptionTxId}`)
      const data = await res.text()
      setDetailedDescription(data)
    } catch (error) {
      console.error(error)
    }

    setIsDetailedDescriptionLoading(false)
  }

  function handleCopyLinkToClipBoard(link: string) {
    navigator.clipboard.writeText(link)
    toast.success('Copied to clipboard!')
  }
  if (loadingStatus === 'PENDING') {
    return (
      <div className="h-full flex-1 flex flex-col max-w-[960px] px-8 mx-auto w-full my-6 gap-2">
        {/* HACKATHON HEADER */}
        <div className="flex justify-between">
          <Button onClick={goBack} variant="primary-solid">
            <FaArrowLeft className="h-4 w-4 text-white" />
          </Button>
        </div>
        <div className="w-full flex-1 flex h-full items-center justify-center">
          <FadeLoader color="#56ADD9" />
        </div>
      </div>
    )
  }
  if (!submission || !selectedHackathon) return <Navigate to={`/hackathon`} />

  const isHackathonOwner = address && selectedHackathon ? selectedHackathon.createdBy === loggedInUserAddress : false
  const hasHackathonEnded = selectedHackathon ? selectedHackathon.endsAt * 1000 < Date.now() : false

  function handleOpenUrlInNewTab(url: string) {
    window.open(url, '_blank')
  }

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
          <p className="text-gray-800 text-lg">{submission.projectName || 'No project name'}</p>
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium text-gray-900">Short Description</h2>
          <p className="text-gray-800 text-lg">{submission.shortDescription || 'No short description'}</p>
        </div>
        <div className="absolute right-0">
          <img
            onError={({ currentTarget }) => {
              currentTarget.onerror = null // prevents looping
              currentTarget.src = 'https://placehold.co/500x500?text=LOGO'
            }}
            src={getLogoUrl(submission?.logo)}
            className="w-24 h-24 rounded-full"
          />
        </div>
        {submission?.technologiesUsed && (
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium text-gray-900">Technologies Used</h2>
            <div className="flex gap-2">
              {strToArray(submission.technologiesUsed).map((tag) =>
                tag ? (
                  <div className="flex px-4 py-[1px] items-center bg-primary-600 rounded-full text-white">{tag}</div>
                ) : null
              )}
            </div>
          </div>
        )}
        {submission.links.length > 0 && (
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium text-gray-900">Links</h2>
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
                  <div className="flex gap-2 absolute right-3 items-center">
                    <FaClipboard
                      onClick={() => handleCopyLinkToClipBoard(link)}
                      className="w-5 h-5 cursor-pointer text-primary-600"
                    />
                    <FaExternalLinkAlt
                      onClick={() => handleOpenUrlInNewTab(link)}
                      className="w-4 h-4 cursor-pointer text-primary-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {submission.images.length > 0 && (
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium text-gray-900">Images</h2>
            <div className="gap-2  flex flex-col">
              {submission.images.map((image) => (
                <div className="relative justify-center flex flex-col ">
                  <input
                    type="text"
                    className={
                      'bg-white border-[1px] text-gray-900 border-gray-300 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none'
                    }
                    value={image}
                    disabled
                    readOnly
                  />
                  <div className="flex gap-2 absolute right-3 items-center">
                    <FaClipboard
                      onClick={() => handleCopyLinkToClipBoard(image)}
                      className="w-5 h-5 cursor-pointer text-primary-600"
                    />
                    <FaExternalLinkAlt
                      onClick={() => handleOpenUrlInNewTab(image)}
                      className="w-4 h-4 cursor-pointer text-primary-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {submission.video && (
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium text-gray-900">Video</h2>
            <div className="flex gap-2">
              <div className="relative justify-center flex flex-col w-full">
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

        {detailedDescription && !isDetailedDescriptionLoading && (
          <div>
            <h2 className="text-lg font-medium text-gray-900">Detailed Description</h2>
            <div className="py-1">
              <MDEditor.Markdown
                className="!min-h-[200px] rounded-b-lg !bg-transparent"
                source={detailedDescription}
                // rehypePlugins={[[rehypeAnchorOnClickPlugin]]}
              />
            </div>
          </div>
        )}
      </div>

      <WinnerModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} participantAddress={submission.submittedBy} />
    </div>
  )
}
