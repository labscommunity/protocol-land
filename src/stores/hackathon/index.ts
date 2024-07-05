import toast from 'react-hot-toast'
import { StateCreator } from 'zustand'

import { withAsync } from '@/helpers/withAsync'

import { CombinedSlices } from '../types'
import { getAllHackathons, getHackathonById, participate, postNewHackathon } from './actions'
import { HackathonSlice, HackathonState } from './types'
const initialHackathonState: HackathonState = {
  hackathons: [],
  selectedHackathon: null,
  status: 'IDLE',
  error: null
}

const createHackathonSlice: StateCreator<CombinedSlices, [['zustand/immer', never], never], [], HackathonSlice> = (
  set,
  get
) => ({
  hackathonState: initialHackathonState,
  hackathonActions: {
    fetchAllHackathons: async () => {
      set((state) => {
        state.hackathonState.status = 'PENDING'
      })

      const { response, error } = await withAsync(getAllHackathons)

      if (error) {
        toast.error('Failed to fetch hackathons.')

        return
      }

      if (response) {
        set((state) => {
          state.hackathonState.hackathons = response
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

      if (response) {
        set((state) => {
          state.hackathonState.selectedHackathon = response
          state.hackathonState.status = 'SUCCESS'
        })
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
    setSelectedHackathon: (hackathon) => {
      set((state) => {
        state.hackathonState.selectedHackathon = hackathon
      })
    },
    participateInHackathon: async (id) => {
      const { error } = await withAsync(() => participate(id))

      if (error) {
        toast.error('Failed to participate in hackathon.')
        set((state) => {
          state.hackathonState.status = 'ERROR'
        })

        return
      }

      await get().hackathonActions.fetchHackathonById(id)
    }
  }
})

export default createHackathonSlice
