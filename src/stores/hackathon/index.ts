import toast from 'react-hot-toast'
import { StateCreator } from 'zustand'

import { withAsync } from '@/helpers/withAsync'

import { CombinedSlices } from '../types'
import {
  createHackathonTeam,
  getAllHackathons,
  getHackathonById,
  getHackathonSubmission,
  participate,
  postNewHackathon,
  postUpdatedHackathon,
  publishHackathonSubmission,
  saveHackathonSubmission,
  selectPrizeWinner
} from './actions'
import { HackathonSlice, HackathonState } from './types'
const initialHackathonState: HackathonState = {
  hackathons: [],
  selectedHackathon: null,
  selectedSubmission: null,
  participant: null,
  status: 'IDLE',
  error: null
}

const createHackathonSlice: StateCreator<CombinedSlices, [['zustand/immer', never], never], [], HackathonSlice> = (
  set,
  get
) => ({
  hackathonState: initialHackathonState,
  hackathonActions: {
    resetSelectedSubmission: () => {
      set((state) => {
        state.hackathonState.selectedSubmission = null
      })
    },
    fetchAllHackathons: async () => {
      set((state) => {
        state.hackathonState.status = 'PENDING'
      })

      const { response, error } = await withAsync(getAllHackathons)

      if (error) {
        toast.error('Failed to fetch hackathons.')
        set((state) => {
          state.hackathonState.status = 'ERROR'
        })
        return
      }

      if (response) {
        set((state) => {
          state.hackathonState.hackathons = response
          state.hackathonState.status = 'SUCCESS'
        })
      }
    },
    fetchHackathonById: async (id) => {
      set((state) => {
        state.hackathonState.status = 'PENDING'
      })

      const { response } = await withAsync(() => getHackathonById(id))

      if (!response) {
        toast.error('Failed to fetch hackathon.')
        set((state) => {
          state.hackathonState.status = 'ERROR'
        })
        return
      }

      const userAddress = get().authState.address

      if (response) {
        set((state) => {
          state.hackathonState.participant = userAddress ? response.participants[userAddress] : null
          state.hackathonState.selectedHackathon = response
          state.hackathonState.status = 'SUCCESS'
        })

        await get().hackathonActions.fetchHackathonSubmission(id)
      }
    },
    createNewHackathon: async (newHackathonItem) => {
      const address = get().authState.address

      if (!address) {
        set((state) => {
          state.hackathonState.status = 'ERROR'
        })

        return
      }

      set((state) => {
        state.hackathonState.status = 'PENDING'
      })

      const { error } = await withAsync(() => postNewHackathon(newHackathonItem))

      if (error) {
        toast.error('Failed to post hackathon.')
        set((state) => {
          state.hackathonState.status = 'ERROR'
        })

        return
      }

      set((state) => {
        state.hackathonState.status = 'SUCCESS'
      })
    },
    updateHackathon: async (hackathon) => {
      const address = get().authState.address
      const selectedHackathon = get().hackathonState.selectedHackathon

      if (!address || !selectedHackathon) {
        set((state) => {
          state.hackathonState.status = 'ERROR'
        })

        return
      }

      set((state) => {
        state.hackathonState.status = 'PENDING'
      })

      const { error } = await withAsync(() => postUpdatedHackathon(hackathon))

      if (error) {
        toast.error('Failed to post hackathon.')
        set((state) => {
          state.hackathonState.status = 'ERROR'
        })

        return
      }

      set((state) => {
        if (hackathon.descriptionTxId && state.hackathonState.selectedHackathon) {
          state.hackathonState.selectedHackathon.descriptionTxId = hackathon.descriptionTxId
        }
        state.hackathonState.status = 'SUCCESS'
      })
    },
    setSelectedHackathon: (hackathon) => {
      set((state) => {
        state.hackathonState.selectedHackathon = hackathon
      })
    },
    assignPrizeToSubmission: async (hackathonId, prizeId, participantAddress) => {
      const { error } = await withAsync(() => selectPrizeWinner(hackathonId, prizeId, participantAddress))

      if (error) {
        toast.error('Failed to assign prize to submission.')
        return
      }

      await get().hackathonActions.fetchHackathonById(hackathonId)

      return true
    },
    participateInHackathon: async (id, teamId) => {
      const { error } = await withAsync(() => participate(id, teamId))

      if (error) {
        toast.error('Failed to participate in hackathon.')
        set((state) => {
          state.hackathonState.status = 'ERROR'
        })

        return
      }

      await get().hackathonActions.fetchHackathonById(id)
    },
    createNewTeam: async (name) => {
      const address = get().authState.address
      const selectedHackathon = get().hackathonState.selectedHackathon

      if (!address || !selectedHackathon) {
        set((state) => {
          state.hackathonState.status = 'ERROR'
        })

        return
      }

      set((state) => {
        state.hackathonState.status = 'PENDING'
      })

      const { error, response } = await withAsync(() =>
        createHackathonTeam({ hackathonId: selectedHackathon.id, members: [], name })
      )

      if (error) {
        toast.error('Failed to post hackathon.')
        set((state) => {
          state.hackathonState.status = 'ERROR'
        })

        return
      }

      if (response) {
        set((state) => {
          if (state.hackathonState.selectedHackathon) {
            state.hackathonState.selectedHackathon.teams[response.id] = response
            state.hackathonState.status = 'SUCCESS'
          }
        })

        return response
      }
    },
    fetchHackathonSubmission: async (hackathonId) => {
      if (get().hackathonState.status !== 'PENDING') {
        set((state) => {
          state.hackathonState.status = 'PENDING'
        })
      }

      const selectedHackathon = get().hackathonState.selectedHackathon
      const address = get().authState.address

      if (!selectedHackathon || !address) {
        return
      }

      const { response } = await withAsync(() => getHackathonSubmission(hackathonId, address))

      if (!response) {
        set((state) => {
          state.hackathonState.status = 'SUCCESS'
        })
        return
      }

      set((state) => {
        state.hackathonState.selectedSubmission = response
        state.hackathonState.status = 'SUCCESS'
      })
    },
    saveSubmission: async (hackathonId, submission, publish = false) => {
      if (Object.keys(submission).length > 0) {
        const { error } = await withAsync(() => saveHackathonSubmission(hackathonId, submission))

        if (error) {
          toast.error('Failed to save submission.')
          return
        }
      }

      set((state) => {
        state.hackathonState.selectedSubmission = {
          ...(state.hackathonState.selectedSubmission || {}),
          ...submission
        }
      })

      if (publish) {
        await get().hackathonActions.publishSubmission(hackathonId)
      } else {
        toast.success('Submission saved successfully.')
      }
    },
    publishSubmission: async (hackathonId) => {
      const selectedSubmission = get().hackathonState.selectedSubmission

      if (!selectedSubmission) {
        toast.error('Please save the project details first.')
        return
      }

      const { error } = await withAsync(() => publishHackathonSubmission(hackathonId))

      if (error) {
        toast.error('Failed to publish submission.')
        return
      }

      set((state) => {
        if (state.hackathonState.selectedSubmission) {
          state.hackathonState.selectedSubmission.status = 'PUBLISHED'
        }
      })

      toast.success('Submission published successfully.')
    },
    isParticipant: async () => {
      const address = get().authState.address
      const selectedHackathon = get().hackathonState.selectedHackathon
      const participant = get().hackathonState.participant

      if (!address || !selectedHackathon || !participant) {
        return false
      }

      return participant.address === address
    },
    setParticipant: () => {
      const selectedHackathon = get().hackathonState.selectedHackathon
      const address = get().authState.address

      if (!selectedHackathon || !address) {
        return
      }

      const participant = selectedHackathon.participants[address]
      set((state) => {
        state.hackathonState.participant = participant
      })
    }
  }
})

export default createHackathonSlice
