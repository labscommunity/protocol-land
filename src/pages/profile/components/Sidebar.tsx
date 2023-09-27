import { AiOutlineTwitter, AiTwotoneMail } from 'react-icons/ai'
import { BsGlobe } from 'react-icons/bs'
import { TiLocation } from 'react-icons/ti'

import { Button } from '@/components/common/buttons'
import { shortenAddress } from '@/helpers/shortenAddress'

import Avatar from './Avatar'

export default function Sidebar() {
  return (
    <div className="flex flex-col w-[296px] gap-4">
      <Avatar />
      <div className="flex flex-col">
        <h2 className="font-bold text-liberty-dark-100 text-2xl">Sai Kranthi</h2>
        <h3 className="font-medium text-liberty-dark-100 text-lg">kranthicodes</h3>
        <h3 className="font-medium text-liberty-dark-100 text-md">
          {shortenAddress('owtC4zvNF_S2C42-Rb-PC1vuuF6bzcqIUlmQvd-Bo50', 9)}
        </h3>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 items-center text-liberty-dark-100 text-lg">
          <TiLocation />
          <h4>Hyderabad, India</h4>
        </div>
        <div className="flex gap-2 items-center text-liberty-dark-100 text-lg">
          <AiOutlineTwitter />
          <h4>@kranthicodes</h4>
        </div>
        <div className="flex gap-2 items-center text-liberty-dark-100 text-lg">
          <AiTwotoneMail />
          <h4>iamsaikranthi@gmail.com</h4>
        </div>
        <div className="flex gap-2 items-center text-liberty-dark-100 text-lg">
          <BsGlobe />
          <h4>https://kranthicodes.com</h4>
        </div>
      </div>
      <div className="w-full mt-4">
        <Button className="w-full rounded-full" variant="solid">
          Edit details
        </Button>
      </div>
    </div>
  )
}
