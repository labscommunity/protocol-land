import React from 'react'

export default function PeopleTab() {
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
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary-600 text-white hover:bg-primary-600/90 h-10 px-4 py-2">
            Invite Member
          </button>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-0">
            <ul>
              <li className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <img className="aspect-square h-full w-full" alt="Juan Benet" src="https://placehold.co/40x40" />
                    </span>
                    <div>
                      <a href="/user/jbenet" className="font-semibold hover:underline">
                        Juan Benet
                      </a>
                      <p className="text-sm text-gray-500">@jbenet</p>
                    </div>
                  </div>
                  <div
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary-600 text-white hover:bg-primary-600/80"
                    data-v0-t="badge"
                  >
                    Admin
                  </div>
                </div>
              </li>
              <li className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <img
                        className="aspect-square h-full w-full"
                        alt="Molly Mackinlay"
                        src="https://placehold.co/40x40"
                      />
                    </span>
                    <div>
                      <a href="/user/momack2" className="font-semibold hover:underline">
                        Molly Mackinlay
                      </a>
                      <p className="text-sm text-gray-500">@momack2</p>
                    </div>
                  </div>
                  <div
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary-600 text-white hover:bg-primary-600/80"
                    data-v0-t="badge"
                  >
                    Member
                  </div>
                </div>
              </li>
              <li className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <img className="aspect-square h-full w-full" alt="David Dias" src="https://placehold.co/40x40" />
                    </span>
                    <div>
                      <a href="/user/daviddias" className="font-semibold hover:underline">
                        David Dias
                      </a>
                      <p className="text-sm text-gray-500">@daviddias</p>
                    </div>
                  </div>
                  <div
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary-600 text-white hover:bg-primary-600/80"
                    data-v0-t="badge"
                  >
                    Member
                  </div>
                </div>
              </li>
              <li className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <img
                        className="aspect-square h-full w-full"
                        alt="Dietrich Ayala"
                        src="https://placehold.co/40x40"
                      />
                    </span>
                    <div>
                      <a href="/user/autonome" className="font-semibold hover:underline">
                        Dietrich Ayala
                      </a>
                      <p className="text-sm text-gray-500">@autonome</p>
                    </div>
                  </div>
                  <div
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary-600 text-white hover:bg-primary-600/80"
                    data-v0-t="badge"
                  >
                    Member
                  </div>
                </div>
              </li>
              <li className="p-4 ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <img
                        className="aspect-square h-full w-full"
                        alt="Adin Schmahmann"
                        src="https://placehold.co/40x40"
                      />
                    </span>
                    <div>
                      <a href="/user/aschmahmann" className="font-semibold hover:underline">
                        Adin Schmahmann
                      </a>
                      <p className="text-sm text-gray-500">@aschmahmann</p>
                    </div>
                  </div>
                  <div
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary-600 text-white hover:bg-primary-600/80"
                    data-v0-t="badge"
                  >
                    Member
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
