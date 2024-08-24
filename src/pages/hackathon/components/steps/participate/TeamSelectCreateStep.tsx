import { Select } from '@headlessui/react'
import clsx from 'clsx'
import React from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import ButtonWithLoadAndError from '@/components/common/buttons/CustomButton'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'

type Props = {
  handleStepChange: (num: number) => void
}

export default function TeamSelectCreateStep(_: Props) {
  const [selectedTeam, setSelectedTeam] = React.useState('')
  const [submitStatus, setSubmitStatus] = React.useState<'neutral' | 'loading' | 'error' | 'success'>('neutral')
  const [teamName, setTeamName] = React.useState('')
  const [teamType, setTeamType] = React.useState('individual')
  const [selectedHackathon, createNewTeam, participateInHackathon] = useGlobalStore((state) => [
    state.hackathonState.selectedHackathon,
    state.hackathonActions.createNewTeam,
    state.hackathonActions.participateInHackathon
  ])
  const navigate = useNavigate()

  async function handleTeamNameSubmission() {
    if (!selectedHackathon) return
    setSubmitStatus('loading')

    if (teamType === 'individual') {
      const { error } = await withAsync(() => participateInHackathon(selectedHackathon.id))

      if (error) {
        setSubmitStatus('error')
        toast.error('Failed to participate in this hackathon. Try again.')
        return
      }

      if (!error) {
        setSubmitStatus('success')
        navigate(`/hackathon/${selectedHackathon.id}`)
        return
      }
    }

    if (teamType === 'new-team') {
      if (!teamName) {
        toast.error('Please enter a team name.')
        return
      }
      const { error, response } = await withAsync(() => createNewTeam(teamName))

      if (!error && response) {
        const { error } = await withAsync(() => participateInHackathon(selectedHackathon.id, response.id))

        if (error) {
          setSubmitStatus('error')
          return
        }
        setSubmitStatus('success')
        navigate(`/hackathon/${selectedHackathon.id}`)
        return
        // handleStepChange(2) redirect instead
      }

      if (error) {
        setSubmitStatus('error')
        toast.error('Failed to create a team. Try again.')
        return
      }
    }

    if (teamType === 'select-team') {
      if (!selectedTeam) {
        toast.error('Please select a team.')
        return
      }
      const { error } = await withAsync(() => participateInHackathon(selectedHackathon.id, selectedTeam))
      if (error) {
        setSubmitStatus('error')
        toast.error('Failed to participate in this hackathon. Try again.')
        return
      }
      if (!error) {
        setSubmitStatus('success')
        navigate(`/hackathon/${selectedHackathon.id}`)
        return
      }
    }
  }
  return (
    <>
      <div className="p-2 my-6 flex flex-col w-full gap-6">
        <div className="flex flex-col flex-start gap-6">
          <div className="flex">
            <h1 className="text-xl font-medium">Team selection</h1>
          </div>
        </div>
        <div className="flex gap-4">
          <div
            className={`rounded-lg transition-colors ${teamType === 'individual' ? 'bg-primary-600' : 'bg-zinc-900'}`}
          >
            <button
              onClick={() => setTeamType('individual')}
              className={`w-full origin-top-left rounded-lg border px-6 py-3 text-xs font-medium transition-all md:text-base ${
                teamType === 'individual'
                  ? '-translate-y-1 border-primary-600 bg-white text-primary-600'
                  : 'border-zinc-900 bg-white text-zinc-900 hover:-rotate-2'
              }`}
            >
              Individual
            </button>
          </div>

          <div
            className={`rounded-lg transition-colors ${teamType === 'select-team' ? 'bg-primary-600' : 'bg-zinc-900'}`}
          >
            <button
              onClick={() => setTeamType('select-team')}
              className={`w-full origin-top-left rounded-lg px-6 border py-3 text-xs font-medium transition-all md:text-base ${
                teamType === 'select-team'
                  ? '-translate-y-1 border-primary-600 bg-white text-primary-600'
                  : 'border-zinc-900 bg-white text-zinc-900 hover:-rotate-2'
              }`}
            >
              Select Team
            </button>
          </div>
          <div className={`rounded-lg transition-colors ${teamType === 'new-team' ? 'bg-primary-600' : 'bg-zinc-900'}`}>
            <button
              onClick={() => setTeamType('new-team')}
              className={`w-full origin-top-left rounded-lg px-6 border py-3 text-xs font-medium transition-all md:text-base ${
                teamType === 'new-team'
                  ? '-translate-y-1 border-primary-600 bg-white text-primary-600'
                  : 'border-zinc-900 bg-white text-zinc-900 hover:-rotate-2'
              }`}
            >
              New Team
            </button>
          </div>
        </div>
        {teamType === 'individual' && (
          <div className="flex w-full flex-col gap-4">
            <div className="flex items-center justify-end gap-2 mt-8">
              <ButtonWithLoadAndError status={submitStatus} onClick={handleTeamNameSubmission}>
                Participate
              </ButtonWithLoadAndError>
            </div>
          </div>
        )}

        {teamType === 'new-team' && (
          <div className="flex w-full flex-col gap-4">
            <div className="w-full flex flex-col">
              <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-600">
                Team name
              </label>
              <div className="flex flex-col items-start gap-4">
                <input
                  onChange={(evt) => setTeamName(evt.target.value)}
                  type="text"
                  className={clsx(
                    'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                    'border-gray-300'
                  )}
                  placeholder="Ex: Gryffindor"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-8">
              <ButtonWithLoadAndError status={submitStatus} onClick={handleTeamNameSubmission}>
                Participate
              </ButtonWithLoadAndError>
            </div>
          </div>
        )}

        {teamType === 'select-team' && (
          <div className="flex w-full flex-col gap-1">
            <div className="w-full flex flex-col">
              <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-600">
                Select team
              </label>
            </div>
            <div className="flex flex-col items-start gap-4">
              <div
                className={clsx(
                  'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-[10px] outline-none',
                  'border-gray-300'
                )}
              >
                <Select
                  className="w-full outline-none"
                  name="team"
                  aria-label="Team"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  <option>Select a team</option>
                  {selectedHackathon &&
                    Object.values(selectedHackathon.teams).map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-8">
              <ButtonWithLoadAndError status={submitStatus} onClick={handleTeamNameSubmission}>
                Participate
              </ButtonWithLoadAndError>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
