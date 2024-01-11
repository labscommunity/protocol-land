import { format } from 'date-fns/esm'

import { MarkdownDocument } from '../utils'

export default function ArticleMeta({ frontMatter }: { frontMatter: MarkdownDocument }) {
  return (
    <>
      <p className="text-primary-400 font-bold tracking-wider text-lg max-[809px]:text-base">{frontMatter.category}</p>
      <div className="flex justify-center max-w-[970px] w-[85%] max-[809px]:w-full break-words">
        <h1 className="text-white font-bold text-[60px] max-[809px]:text-4xl font-inter text-center leading-[1.3em]">{frontMatter.title}</h1>
      </div>
      <div className="flex justify-center max-w-[970px] w-[85%] max-[809px]:w-full break-words">
        <p className="text-gray-300 font-medium text-2xl max-[809px]:text-lg font-inter text-center leading-[1.4em]">
          {frontMatter.description}
        </p>
      </div>
      <div className="flex justify-center w-full">
        <p className="text-gray-200 text-lg max-[809px]:text-base font-medium">{format(new Date(frontMatter.publishedAt), 'MMM dd, yyyy')}</p>
      </div>
      <div className="rounded-[15px] overflow-hidden w-full relative max-w-[728px]">
        <img
          src={frontMatter.coverImage}
          alt="cover-image"
          className="w-full h-full object-cover object-center block"
        />
      </div>
    </>
  )
}
