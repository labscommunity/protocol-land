import React from 'react'

import { shortenAddress } from '@/helpers/shortenAddress'
import { useGlobalStore } from '@/stores/globalStore'

import InvitePeopleModal from './components/InvitePeopleModal'

export default function PeopleTab() {
  const [selectedOrganization] = useGlobalStore((state) => [state.organizationState.selectedOrganization])
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div>
      <div className="mt-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-search absolute left-2 top-2.5 h-4 w-4 text-gray-500"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8"
              placeholder="Find a member"
            />
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary-600 text-white hover:bg-primary-600/90 h-10 px-4 py-2"
          >
            Invite Member
          </button>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-0">
            <ul>
              {selectedOrganization.organization?.memberInvites.map((invite) => (
                <li className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full items-center justify-center bg-gray-200">
                        {invite.address.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <a
                          href={`#/user/${invite.address}`}
                          className="font-semibold hover:underline"
                          title={invite.address}
                        >
                          {shortenAddress(invite.address)}
                        </a>
                        {/* <p className="text-sm text-gray-500">{member.username}</p> */}
                      </div>
                    </div>
                    <div
                      className="inline-flex capitalize items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-yellow-500/70 text-white hover:bg-yellow-400/80"
                      data-v0-t="badge"
                    >
                      {invite.status.toLowerCase()}
                    </div>
                  </div>
                </li>
              ))}
              {selectedOrganization.organization?.members.map((member) => (
                <li className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full items-center justify-center bg-gray-200">
                        {member.address.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <a
                          href={`#/user/${member.address}`}
                          className="font-semibold hover:underline"
                          title={member.address}
                        >
                          {shortenAddress(member.address)}
                        </a>
                        {/* <p className="text-sm text-gray-500">{member.username}</p> */}
                      </div>
                    </div>
                    <div
                      className="inline-flex capitalize items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary-600 text-white hover:bg-primary-600/80"
                      data-v0-t="badge"
                    >
                      {member.role.toLowerCase()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <InvitePeopleModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  )
}
