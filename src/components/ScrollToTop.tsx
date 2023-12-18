import { useEffect, useState } from 'react'
import { FaArrowCircleUp } from 'react-icons/fa'

const ScrollToTop = ({ top = 20, className = '', ...props }) => {
  const [visible, setVisible] = useState(false)

  const handleScroll = () => {
    setVisible(window.scrollY >= top)
  }

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [top])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <>
      <div
        className={`fixed flex group flex-col items-center space-y-2 right-4 bottom-4 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          className={`bg-primary-600 text-white p-2 rounded-full shadow-md hover:bg-primary-700 hover:shadow-lg ${className}`}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          {...props}
        >
          <FaArrowCircleUp className="h-6 w-6" />
        </button>
        <span className="text-slate-600 invisible group-hover:visible text-sm font-medium">Scroll to Top</span>
      </div>
    </>
  )
}

export default ScrollToTop
