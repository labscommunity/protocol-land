import Markdoc from '@markdoc/markdoc'
import { useLiveQuery } from 'dexie-react-hooks'
import React from 'react'
import { useLocation } from 'react-router-dom'

import Footer from '@/components/Landing/Footer'
import Navbar from '@/components/Landing/Navbar'
import { Seo } from '@/components/Seo'
import { trackGoogleAnalyticsPageView } from '@/helpers/google-analytics'
import { withAsync } from '@/helpers/withAsync'

import ArticleMeta from './components/ArticleMeta'
import Author from './components/Author'
import { components, config } from './components/MarkDoc'
import { fetchStaticMetadata, getParsedFrontmatter, loadBlogPages } from './utils'
import { blogDB } from './utils/blog'

export default function Article() {
  const location = useLocation()
  const article = useLiveQuery(() => blogDB.blog.get({ path: location.pathname }))

  React.useEffect(() => {
    loadBlogs()
    trackGoogleAnalyticsPageView('pageview', location.pathname, 'Article Page Visit')
  }, [])

  async function loadBlogs() {
    const { response } = await withAsync(() => fetchStaticMetadata('/metadata.json'))

    if (!response) return

    loadBlogPages(response.blog)
  }

  if (article) {
    const ast = Markdoc.parse(article.body)
    const frontMatter = getParsedFrontmatter(ast)
    const content = Markdoc.transform(ast, config)

    const component = Markdoc.renderers.react(content, React, { components })

    return (
      <>
        <Seo
          title={`${frontMatter.title} | Protocol.Land Blog`}
          description={frontMatter.description}
          type="website"
          image={frontMatter.coverImage}
        />
        <div className="absolute bg-[#001d39] z-0 w-full">
          <div className="md:px-16 lg:px-20 xl:px-24 2xl:px-48 min-h-screen">
            <Navbar />
            <div className="w-full mx-auto max-w-[1200px] max-[809px]:px-[20px] max-[809px]:pt-[100px] max-[809px]:pb-[50px] px-[50px] pt-[100px] pb-[50px] flex flex-col gap-[30px] items-center justify-start">
              <ArticleMeta frontMatter={frontMatter} />
              <div className="flex max-w-[700px] whitespace-pre-wrap break-words w-full outline-none flex-col justify-start">
                {component}
              </div>
              <Author author={frontMatter.author} />
            </div>
            <Footer />
          </div>
        </div>
      </>
    )
  }
}
