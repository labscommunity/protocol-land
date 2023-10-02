import React from 'react'
import { AiFillCamera } from 'react-icons/ai'
import { BsFillPersonFill } from 'react-icons/bs'

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
              <span className="text-white cursor-pointer flex items-center justify-center h-full w-full font-bold text-xl bg-black bg-opacity-50 p-2 rounded-full">
                <AiFillCamera className="w-32 h-32 text-white" />
              </span>
            </div>
            <input onChange={handleAvatarChange} ref={avatarInputRef} type="file" hidden />
          </div>
        )}
        {!avatarUrl && (
          <div
            onClick={handleAvatarSelectClick}
            className="cursor-pointer  w-full h-[296px] bg-slate-500 rounded-full flex items-center justify-center"
          >
            <AiFillCamera className="w-32 h-32 text-white" />
            <input onChange={handleAvatarChange} ref={avatarInputRef} type="file" hidden />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex">
      {!url && (
        <div className="w-full rounded-full bg-slate-400 h-[296px] flex items-center justify-center">
          <BsFillPersonFill className="w-32 h-32 text-white" />
        </div>
      )}
      {url && <img src={`https://arweave.net/${url}`} className="rounded-full" alt="profile-pic" />}
    </div>
  )
}
