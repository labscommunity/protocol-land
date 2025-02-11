import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { resolveUsernameOrShorten } from '@/helpers/resolveUsername'
import { useGlobalStore } from '@/stores/globalStore'
import { Organization } from '@/types/orgs'

import OrgItem from './components/OrgItem'

export default function OrganizationsTab({ userOrgs }: { userOrgs: Organization[] }) {
  const { id: userAddress } = useParams()
  const [connectedAddress] = useGlobalStore((state) => [state.authState.address])
  const [searchTerm, setSearchTerm] = useState('')
  const filteredOrgs = useMemo(() => {
    if (userOrgs.length > 0) {
      return userOrgs.filter((org) => {
        if (org.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true
        }
        return false
      })
    }
    return userOrgs
  }, [userOrgs, searchTerm, connectedAddress])

  function getOrgRole(org: Organization) {
    if (org.owner === userAddress) return 'Owner'

    const memberObj = org.members.find((member) => member.address === userAddress)
    if (memberObj) return memberObj.role
    return 'Member'
  }

  return (
    <div>
      <input
        type="text"
        className={clsx(
          'bg-white border-[1px] text-gray-900 text-base rounded-lg hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:border-primary-500 focus:border-[1.5px] block w-full px-3 py-2 outline-none border-gray-300'
        )}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Find an organization..."
      />
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {filteredOrgs.map((org) => (
          <OrgItem
            members={org.members.length}
            id={org.id}
            name={org.name}
            description={org.description}
            isPrivate={false}
            repos={org.repos.length}
            role={getOrgRole(org)}
          />
        ))}
        {filteredOrgs.length === 0 &&
          (filteredOrgs.length === userOrgs.length ? (
            <span className="text-center font-medium">
              {resolveUsernameOrShorten(userAddress!)} doesn't have any organizations yet.
            </span>
          ) : (
            <span className="text-center">
              <b>0</b> results for organizations matching <b>{searchTerm}</b>
            </span>
          ))}
      </div>
    </div>
  )
}
