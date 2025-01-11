import React from 'react'
import { AiFillCamera } from 'react-icons/ai'

export default function Avatar({
  url,
  mode,
  setAvatar
}: {
  url: string | undefined
  mode: 'EDIT' | 'READ'
  setAvatar: (file: File) => void
}) {
  const avatarInputRef = React.useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = React.useState<null | string>(null)

  async function handleAvatarSelectClick() {
    avatarInputRef.current?.click()
  }

  async function handleAvatarChange(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.target.files && evt.target.files[0]) {
      const url = URL.createObjectURL(evt.target.files[0])

      setAvatar(evt.target.files[0])
      setAvatarUrl(url)
    }
  }

  if (mode === 'EDIT') {
    return (
      <div className="flex justify-center">
        {avatarUrl && (
          <div onClick={handleAvatarSelectClick} className="relative hover:bg-opacity-50 transition-all duration-300">
            <img src={avatarUrl} className="rounded-full w-full h-[296px]" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <span className="text-white cursor-pointer flex items-center justify-center h-full w-full font-bold text-xl bg-gray-400 p-2 rounded-full">
                <AiFillCamera className="w-32 h-32 text-white" />
              </span>
            </div>
            <input onChange={handleAvatarChange} ref={avatarInputRef} type="file" hidden />
          </div>
        )}
        {!avatarUrl && (
          <div
            onClick={handleAvatarSelectClick}
            className="cursor-pointer  w-full h-[296px] bg-gray-400 rounded-full flex items-center justify-center"
          >
            <AiFillCamera className="w-32 h-32 text-white" />
            <input onChange={handleAvatarChange} ref={avatarInputRef} type="file" hidden />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      {!url && (
        <span className="relative flex shrink-0 overflow-hidden rounded-full h-48 w-48 border-4 border-white shadow-lg">
          <img className="aspect-square h-full w-full" alt="Profile picture" src="/placeholder.svg" />
        </span>
      )}
      {url && <img src={`https://arweave.net/${url}`} className="rounded-full" alt="profile-pic" />}
    </div>
  )
}
