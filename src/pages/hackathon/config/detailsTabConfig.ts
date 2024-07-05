import { BsPeople, BsTrophy } from 'react-icons/bs'
import { CgDetailsMore } from 'react-icons/cg'

import DetailsTab from '../components/tabs/details/DetailsTab'
import ParticipantsTab from '../components/tabs/participants/ParticipantsTab'
import PrizesTab from '../components/tabs/prizes/PrizesTab'

const getPath = (id: string | number, tabName?: string) => `/hackathon/${id}/${tabName ? tabName : 'Details'}`
export const detailsTabConfig = [
  {
    title: 'Details',
    Component: DetailsTab,
    Icon: CgDetailsMore,
    getPath
  },
  {
    title: 'Prizes',
    Component: PrizesTab,
    Icon: BsTrophy,
    getPath
  },
  {
    title: 'Participants',
    Component: ParticipantsTab,
    Icon: BsPeople,
    getPath
  }
]
