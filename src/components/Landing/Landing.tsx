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
  return (
    <div className="absolute bg-[#001d39] z-0">
      <div className="px-5 md:px-16 lg:px-20 xl:px-24 2xl:px-48">
        <Navbar />
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
  )
}
