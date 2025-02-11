import { Link } from 'react-router-dom'

type Props = {
  title: string
  description: string
  id: string
  isPrivate: boolean
}

export default function RepoItem({ title, description, id, isPrivate }: Props) {
  if ((!title && !description) || !id) return null
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col p-6 space-y-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link to={`/repository/${id}`} className="text-lg font-semibold hover:underline">
                {title}
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
