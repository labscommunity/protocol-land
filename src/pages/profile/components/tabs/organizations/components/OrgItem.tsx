import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/common/buttons'

type Props = {
  name: string
  description: string
  id: string
  isPrivate: boolean
  members: number
  repos: number
  role: string
}

export default function OrgItem({ name, description, id, isPrivate, members, repos, role }: Props) {
  const navigate = useNavigate()
  if ((!name && !description) || !id) return null

  const handleViewOrg = () => {
    navigate(`/organization/${id}`)
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm group hover:shadow-lg transition-shadow">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-start gap-4">
          <span className="relative flex shrink-0 overflow-hidden h-16 w-16 rounded-lg border">
            <img
              className="aspect-square h-full w-full"
              alt="Protocol Labs"
              src="/placeholder.svg?height=64&amp;width=64"
            />
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <a
                href="/org/protocol-labs"
                className="text-xl font-semibold hover:underline inline-flex items-center gap-2"
              >
                {name}
              </a>
              <div className="inline-flex capitalize items-center rounded-full border px-2.5 py-0.3 text-xs font-medium tracking-wide transition-colors border-gray-300 bg-white text-gray-500 hover:bg-gray-300/80">
                {isPrivate ? 'Private' : 'Public'}
              </div>
            </div>
            {description && <p className="text-sm text-gray-500">{description}</p>}
            {!description && <p className="text-sm text-gray-500 italic">No description</p>}
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-users h-4 w-4"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>{members} members</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-building2 h-4 w-4"
            >
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
              <path d="M10 6h4"></path>
              <path d="M10 10h4"></path>
              <path d="M10 14h4"></path>
              <path d="M10 18h4"></path>
            </svg>
            <span>{repos} repositories</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button onClick={handleViewOrg} variant="primary-solid" className="h-9 w-full text-sm justify-center">
            View Organization
          </Button>
          <div className="inline-flex capitalize items-center rounded-full border px-2.5 py-0.3 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-gray-300 text-gray-500 hover:bg-gray-300/80 hover:text-white">
            {role}
          </div>
        </div>
      </div>
    </div>
  )
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col p-6 space-y-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link to={`/repository/${id}`} className="text-lg font-semibold hover:underline">
                {name}
              </Link>
              <div className="inline-flex capitalize items-center rounded-full border px-2.5 py-0.3 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary-600 text-white hover:bg-primary-600/80">
                {isPrivate ? 'Private' : 'Public'}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
