import { format } from 'date-fns/esm'

import { IBlog } from '@/types/blog'

type Props = { data: IBlog; createBlogClickHandler: (data: IBlog) => () => void }

export default function FeaturedBlogCard({ data, createBlogClickHandler }: Props) {
  return (
    <div
      onClick={createBlogClickHandler(data)}
      className="group hover:cursor-pointer max-w-[1000px] h-fit w-full flex p-[40px] rounded-2xl border border-sky-300 border-opacity-20 bg-[linear-gradient(180deg,rgba(56,124,158,0.20)_0%,rgba(0,0,0,0.20)_100%)]"
    >
      <div className="flex w-full gap-10">
        <div className="group-hover:opacity-[0.6] transition-opacity ease-in duration-400 rounded-[15px] overflow-hidden w-full relative">
          <img src={data.coverImage} alt="cover-image" className="w-full h-full object-cover object-center block" />
        </div>
        <div className="w-full flex flex-col justify-center gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-primary-400 font-bold tracking-wider">{data.category}</p>
            <h2 className="text-white font-bold text-2xl font-inter xl:leading-loose">{data.title}</h2>
          </div>

          <p className="text-white text-lg font-normal font-inter leading-relaxed">{data.description}</p>
          <div className="w-full flex text-white text-lg font-normal font-inter leading-relaxed">
            {format(new Date(data.publishedAt), 'MMM dd, yyyy')}
          </div>
        </div>
      </div>
    </div>
  )
}
