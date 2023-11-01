import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import { BiSearch } from 'react-icons/bi'
import { RiCloseCircleLine, RiGitRepositoryFill } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'

import { shortenAddress } from '@/helpers/shortenAddress'
import { withAsync } from '@/helpers/withAsync'
import { debounce } from '@/helpers/withDebounce'
import { searchRepositories } from '@/stores/repository-core/actions'
import { Repo } from '@/types/repository'

// In-memory cache object
const searchCache: Record<string, Repo[]> = {}

export default function SearchBar() {
  const navigate = useNavigate()

  const searchBoxRef = React.useRef<HTMLDivElement | null>(null)
  const searchInputRef = React.useRef<HTMLInputElement | null>(null)

  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showResultsBox, setShowResultsBox] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [results, setResults] = useState<Repo[]>([])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        handleResultBoxAnimationComplete()
      }
    }

    // Add the click event listener to the document
    document.addEventListener('mousedown', handleClickOutside)

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, []) // The empty dependency array ensures this useEffect runs once when the component mounts and cleans up when it unmounts

  React.useEffect(() => {
    if (searchValue) {
      debouncedFetchSearchResults(searchValue)
    }
  }, [searchValue])

  const fetchSearchResults = async (searchQuery: string) => {
    if (searchCache[searchQuery]) {
      setResults(searchCache[searchQuery])
    } else {
      // Simulating an API call
      setIsLoading(true)
      const { error, response } = await withAsync(() => searchRepositories(searchQuery))
      if (!error && response) {
        searchCache[searchQuery] = response.result
        setResults(response.result)
      }
      setIsLoading(false)
    }
  }

  const debouncedFetchSearchResults = debounce(fetchSearchResults, 300)

  const handleInputChange = (event: any) => {
    setSearchValue(event.target.value)
  }

  const handleInputAnimationComplete = () => {
    if (isFocused) {
      setShowResultsBox(true)
    } else {
      setShowResultsBox(false)
    }
  }

  const handleResultBoxAnimationComplete = () => {
    setShowResultsBox(false)

    setTimeout(() => {
      setIsFocused(false)
    }, 500)
  }

  const handleSearchReset = () => {
    if (isFocused && searchInputRef.current) searchInputRef.current.focus()

    setSearchValue('')
  }

  const handleSearchItemClick = (id: string) => {
    navigate(`/repository/${id}`)

    handleResultBoxAnimationComplete()
  }

  console.log({ results, isLoading, showResultsBox })

  return (
    <motion.div
      ref={searchBoxRef}
      initial={{ width: '25%' }}
      animate={{ width: isFocused ? '65%' : '25%' }}
      transition={{ duration: 0.5 }}
      className="relative rounded-[8px] ml-20 bg-white border-primary-300 hover:border-primary-600 focus-within:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] hover:bg-primary-50 border-[1px]"
      onAnimationComplete={handleInputAnimationComplete}
    >
      <div className="rounded flex items-center w-full p-2 shadow-sm">
        <BiSearch className="w-6 h-6 text-primary-600 relative top-[1px]" />
        {/* <RiGitRepositoryFill className={`w-5 h-5 ${searchValue.length > 0 ? 'text-gray-900' : 'text-gray-500'}`} /> */}

        <input
          type="text"
          ref={searchInputRef}
          placeholder="Find a repository..."
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          className="w-full pl-2 text-base outline-none focus:outline-none bg-transparent text-primary-900 placeholder:text-primary-600"
        />
        {searchValue && (
          <RiCloseCircleLine onClick={handleSearchReset} className="w-5 h-5 text-primary-600 cursor-pointer" />
        )}
      </div>
      <AnimatePresence>
        {showResultsBox && searchValue.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="absolute top-[45px] z-10 w-full bg-white rounded-[8px] p-2 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] border-[1px] border-gray-300"
          >
            {isLoading && (
              <div className="w-full flex gap-2 flex-col h-[80px] justify-center items-center">Loading...</div>
            )}
            {results.length > 0 && !isLoading && (
              <div className="w-full flex gap-2 flex-col max-h-[350px] overflow-y-auto">
                {results.map((repo) => (
                  <div
                    onClick={() => handleSearchItemClick(repo.id)}
                    className="flex flex-col gap-1 hover:bg-primary-50 hover:text-gray-900 [&>div>svg]:hover:text-gray-900 [&>div.search-repo-item-meta>span]:hover:text-gray-900 hover:rounded py-1 px-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 search-repo-item-meta">
                      <RiGitRepositoryFill className="w-5 h-5 text-gray-700" />
                      <span className="text-gray-700">{repo.name}</span>
                    </div>
                    <div className="flex search-repo-item-meta">
                      <span className="text-gray-700">Owner: {shortenAddress(repo.owner, 8)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {results.length === 0 && !isLoading && (
              <div className="w-full flex gap-2 flex-col h-[80px] justify-center items-center">
                <h1 className="text-gray-700 text-lg">No results found.</h1>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
