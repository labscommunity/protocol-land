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

  console.log({ results })

  return (
    <motion.div
      ref={searchBoxRef}
      initial={{ width: '25%' }}
      animate={{ width: isFocused ? '80%' : '25%' }}
      transition={{ duration: 0.5 }}
      className="relative bg-gray-200 rounded ml-20"
      onAnimationComplete={handleInputAnimationComplete}
    >
      <div className="bg-[#F9FAFB] rounded flex items-center w-full p-2 shadow-sm">
        <RiGitRepositoryFill className="w-5 h-5 text-gray-500" />

        <input
          type="text"
          ref={searchInputRef}
          placeholder="my-cool-repo"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          className="w-full pl-4 text-md outline-none focus:outline-none bg-transparent text-liberty-dark-100"
        />
        <div className="flex items-center gap-2">
          {searchValue && (
            <RiCloseCircleLine onClick={handleSearchReset} className="w-5 h-5 text-gray-500 cursor-pointer" />
          )}
          <BiSearch className="w-5 h-5 text-gray-500" />
        </div>
      </div>
      <AnimatePresence>
        {showResultsBox && searchValue.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="absolute top-[45px] z-10 w-full bg-[#F9FAFB] rounded p-2"
          >
            {isLoading && (
              <div className="w-full flex gap-2 flex-col h-[80px] justify-center items-center">Loading...</div>
            )}
            {results.length > 0 && !isLoading && (
              <div className="w-full flex gap-2 flex-col max-h-[350px] overflow-y-auto">
                {results.map((repo) => (
                  <div
                    onClick={() => handleSearchItemClick(repo.id)}
                    className="flex flex-col gap-1 hover:bg-[#4487F5] hover:text-white hover:rounded py-1 px-2 [&>div>svg]:hover:text-white [&>div.search-repo-item-meta>span]:hover:text-white cursor-pointer"
                  >
                    <div className="flex items-center gap-4 search-repo-item-meta">
                      <RiGitRepositoryFill className="w-5 h-5 text-gray-500" />
                      <span className="text-liberty-dark-100">{repo.name}</span>
                    </div>
                    <div className="flex search-repo-item-meta">
                      <span className="text-liberty-dark-100">Owner: {shortenAddress(repo.owner, 8)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {results.length === 0 && !isLoading && (
              <div className="w-full flex gap-2 flex-col h-[80px] justify-center items-center">
                <h1 className="text-liberty-dark-100 text-lg">No results found.</h1>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
