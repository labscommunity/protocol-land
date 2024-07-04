import { BsPeople } from 'react-icons/bs'
import { CgDetailsMore } from 'react-icons/cg'

import DetailsTab from '../components/tabs/details/DetailsTab'
import ParticipantsTab from '../components/tabs/participants/ParticipantsTab'

const getPath = (id: string | number, tabName?: string) => `/hackathon/${id}/${tabName ? tabName : 'Details'}`
export const detailsTabConfig = [
  {
    title: 'Details',
    Component: DetailsTab,
    Icon: CgDetailsMore,
    getPath
  },
  {
    title: 'Participants',
    Component: ParticipantsTab,
    Icon: BsPeople,
    getPath
  }
]
