import React from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import { FadeLoader } from 'react-spinners'

import { Button } from '@/components/common/buttons'
import useStepper from '@/components/Stepper/hooks/useStepper'
import Steps from '@/components/Stepper/Steps'
import { useGlobalStore } from '@/stores/globalStore'

import { participateHackathonSteps } from './config/hackathonParticipateStepsConfig'

const HackathonParticipate = () => {
  const { id } = useParams()
  const [selectedHackathon, loadingStatus, fetchHackathonById] = useGlobalStore((state) => [
    state.hackathonState.selectedHackathon,
    state.hackathonState.status,
    state.hackathonActions.fetchHackathonById
  ])
  const { stepsComplete, handleSetStep, numSteps } = useStepper(2)
  const navigate = useNavigate()

  React.useEffect(() => {
    if (id) {
      fetchHackathonById(id)
    }
  }, [id])

  const Component = participateHackathonSteps[stepsComplete as keyof typeof participateHackathonSteps]

  function goBack() {
    navigate(-1)
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

  return (
    <div className="h-full flex-1 flex flex-col max-w-[960px] px-8 mx-auto w-full my-6 gap-8">
      <div className="flex relative">
        <Button onClick={goBack} variant="primary-solid" className="cursor-pointer z-40">
          <FaArrowLeft className="h-4 w-4 text-white" />
        </Button>
        <div className="absolute w-full flex items-center justify-center h-full z-10">
          <h1 className="text-2xl font-medium text-gray-900">
            Participate in {selectedHackathon?.title || 'Hackathon'}
          </h1>
        </div>
      </div>

      <div className="p-8 bg-white shadow-lg rounded-md w-full mx-auto">
        <Steps numSteps={numSteps} stepsComplete={stepsComplete} />
        <div className="p-2 my-6 bg-transparent">
          <Component handleStepChange={handleSetStep} />
        </div>
      </div>
    </div>
  )
}

export default HackathonParticipate
