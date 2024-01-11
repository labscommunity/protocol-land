import React from 'react'
import { useNavigate } from 'react-router-dom'

import Footer from '@/components/Landing/Footer'
import Navbar from '@/components/Landing/Navbar'
import { Seo } from '@/components/Seo'
import { trackGoogleAnalyticsPageView } from '@/helpers/google-analytics'
import { defaultMetaTagsData } from '@/helpers/seoUtils'
import { withAsync } from '@/helpers/withAsync'
import { IBlog } from '@/types/blog'

import BlogCard from './components/BlogCard'
import FeaturedBlogCard from './components/FeaturedBlogCard'
import { fetchStaticMetadata, loadBlogPages } from './utils'

export default function BlogList() {
  const [blogList, setBlogList] = React.useState<IBlog[]>([])
  const [featuredBlog, setFeaturedBlog] = React.useState<IBlog | null>(null)

  const navigate = useNavigate()

  React.useEffect(() => {
    getAllBlogs()
    trackGoogleAnalyticsPageView('pageview', '/', 'Blog Page Visit')
  }, [])

  async function getAllBlogs() {
    const { response } = await withAsync(() => fetchStaticMetadata('/metadata.json'))

    if (!response) return

    setBlogList(response.blog)

    const featuredBlog = response.blog.find((item) => item.featured === true)

    if (featuredBlog) {
      setFeaturedBlog(featuredBlog)
    }

    loadBlogPages(response.blog)
  }

  function createBlogClickHandler(data: IBlog) {
    return function blogClickHandler() {
      navigate(data.href)
    }
  }

  return (
    <>
      <Seo {...defaultMetaTagsData} title="Protocol.Land | Blog" />
      <div className="absolute bg-[#001d39] z-0 w-full">
        <div className="md:px-16 lg:px-20 xl:px-24 2xl:px-48 min-h-screen">
          <Navbar />
          <div className="w-full px-[20px] lg:px-[40px] xl:px-[100px] max-[809px]:py-[50px] pt-[80px] pb-[100px] flex flex-col gap-[100px]">
            <div className="w-full flex justify-center flex-col items-center gap-5">
              <h1 className="text-7xl max-[809px]:text-[40px] font-bold font-lekton text-primary-400">Blog</h1>
              <p className="text-2xl max-[809px]:text-lg text-white font-inter text-center leading-9">
                Protocol.Land is always evolving. Be part of the progress. <br /> Discover our latest product updates,
                partnership announcements and all things Protocol Land.
              </p>
            </div>

            {featuredBlog && (
              <>
                <div className="w-full justify-center lg:flex hidden">
                  <FeaturedBlogCard createBlogClickHandler={createBlogClickHandler} data={featuredBlog} />
                </div>
                <div className="w-full justify-center max-lg:flex hidden">
                  <BlogCard createBlogClickHandler={createBlogClickHandler} data={featuredBlog} />
                </div>
              </>
            )}
            {blogList.length > 0 && (
              <div className="flex w-full justify-center flex-col gap-10">
                <h1 className="text-5xl max-[809px]:text-3xl font-bold font-lekton text-primary-400">All posts</h1>
                <div className="grid grid-cols-[repeat(2,minmax(200px,_1fr))] max-[809px]:grid-cols-[repeat(1,minmax(200px,_1fr))] gap-5 auto-rows-min h-min w-full justify-center">
                  {blogList.map((blog) => (
                    <BlogCard createBlogClickHandler={createBlogClickHandler} data={blog} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </>
  )
}
