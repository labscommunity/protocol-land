import { FaTwitter } from 'react-icons/fa6'

import { IAuthor } from '@/types/blog'

export default function Author({ author }: { author: IAuthor }) {
  return (
    <div className="flex max-w-[700px] w-full mt-8 justify-between">
      <div className="flex gap-5 items-center w-full">
        <div className="rounded-full overflow-hidden w-[56px] h-[56px] relative max-w-[728px]">
          <img className="w-full h-full object-cover object-center block" src={author.avatar} alt="" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-white font-bold tracking-wider">{author.name}</h3>
          <p className="text-gray-300 text-sm">5 mins read</p>
        </div>
      </div>
      <div className="w-full flex justify-end items-center">
        <a href={author.twitter} target="_blank">
          <FaTwitter className="w-8 h-8 text-[#4999E9] cursor-pointer" />
        </a>
      </div>
    </div>
  )
}
