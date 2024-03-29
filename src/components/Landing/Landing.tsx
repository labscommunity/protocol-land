import { useEffect } from 'react'

import { trackGoogleAnalyticsPageView } from '@/helpers/google-analytics'
import { defaultMetaTagsData } from '@/helpers/seoUtils'

import { Seo } from '../Seo'
import BackedByArweave from './BackedByArweave'
import Bounties from './Bounties'
import Builders from './Builders'
import Cli from './Cli'
import DeveloperCommunity from './DeveloperCommunity'
import Features from './Features'
import Footer from './Footer'
import Header from './Header'
import Navbar from './Navbar'
import OpenSource from './OpenSource'

export default function Landing() {
  useEffect(() => {
    trackGoogleAnalyticsPageView('pageview', '/', 'Landing Page Visit')
  }, [])

  return (
    <>
      <Seo {...defaultMetaTagsData} />
      <div className="absolute bg-[#001d39] z-0">
        <Navbar />
        <div className="px-5 md:px-16 lg:px-20 xl:px-24 2xl:px-48">
          <Header />
          <Features />
          <Cli />
          <Builders />
          <OpenSource />
          <BackedByArweave />
          <DeveloperCommunity />
          <Bounties />
        </div>
        <Footer />
      </div>
    </>
  )
}
