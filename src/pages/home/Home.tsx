import Sidebar from './components/Sidebar'

export default function Home() {
  return (
    <div className="h-full flex">
      {/* sidebar */}
      <Sidebar />
      {/* maincontent */}
      <div className="w-[80%] p-8"></div>
    </div>
  )
}
