import copyTextToClipboard from '@uiw/copy-to-clipboard'
import React from 'react'
import toast from 'react-hot-toast'
import { FaRegFileZipper } from 'react-icons/fa6'
import { PiCaretDownBold } from 'react-icons/pi'
import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'

import IconCloneOutline from '@/assets/icons/clone-outline.svg'
import IconForkOutline from '@/assets/icons/fork-outline.svg'
import IconStarOutline from '@/assets/icons/star-outline.svg'
import LogoLight from '@/assets/pl-logo-light.svg'
import { PL_REPO_ID } from '@/helpers/constants'

import AddFilesButton from './AddFilesButton'
import BranchButton from './BranchButton'
import { files, tabs } from './config'
import RepoStats from './RepoStats'
import RepoTabs from './RepoTabs'
import Row from './Row'
import TransactionId from './TransactionId'

export function InteractiveRepo() {
  const navigate = useNavigate()
  const [showCloneDropdown, setShowCloneDropdown] = React.useState(false)
  const cloneRef = React.useRef<HTMLDivElement | null>(null)

  function handleCopyClone() {
    if (cloneRef.current) {
      const divContent = cloneRef.current.innerText

      copyTextToClipboard(divContent, (isCopied) => {
        if (isCopied) {
          toast.success('Copied to clipboard')
        } else {
          toast.error('Copy to clipboard failed')
        }
      })
    }
  }

  function handleClickCloneDropdown() {
    setShowCloneDropdown(!showCloneDropdown)
  }

  function handleClick() {
    navigate(tabs[0].getPath(PL_REPO_ID))
  }

  return (
    <div className="px-[10px] md:px-[80px] w-full">
      <div className="w-full bg-gray-50 rounded-3xl border border-primary-800 flex-col justify-start items-center flex">
        <div className="self-stretch px-5 py-3 border-b border-gray-200 justify-between items-center flex">
          <div className="justify-start items-center gap-1.5 flex cursor-pointer">
            <div className="w-4 h-6">
              <SVG className="w-full h-full text-primary-600" src={LogoLight} />
            </div>
            <div className="text-primary-600 text-lg font-bold font-inter leading-normal">Protocol.Land</div>
          </div>
        </div>
        <div className="self-stretch h-full px-5 md:px-10 lg:px-20 pb-20 md:pb-52 flex-col justify-start items-center flex">
          <div className="self-stretch h-full pt-5 pb-3 flex-col justify-start items-start gap-3 flex">
            <div className="self-stretch justify-between items-start md:items-center flex flex-col md:flex-row gap-3 md:gap-0">
              <div className="justify-start items-center gap-3 flex">
                <div className="w-9 h-9 p-1.5 bg-white rounded-full border border-gray-300 flex-col justify-center items-center gap-1.5 flex">
                  <div className="text-slate-700 text-base font-bold font-inter leading-snug">PL</div>
                </div>
                <div className="flex-col justify-start items-start flex">
                  <div className="text-gray-900 text-sm md:text-base font-bold font-inter leading-snug">
                    protocol-land
                  </div>
                  <TransactionId className="hidden xl:block" />
                </div>
              </div>
              <div className="relative justify-end items-center gap-3 flex">
                <div
                  className="px-3 py-2 bg-white rounded-md shadow border border-gray-300 justify-center items-center gap-1.5 flex hover:bg-gray-50 cursor-pointer"
                  onClick={handleClick}
                >
                  <div className="w-4 h-4">
                    <SVG className="w-full h-full" src={IconStarOutline} />
                  </div>
                  <div className="text-gray-900 text-sm md:text-base font-medium font-inter leading-normal">10</div>
                </div>
                <div
                  className="px-3 py-2 bg-white rounded-md shadow border border-gray-300 justify-center items-center gap-1.5 flex cursor-pointer hover:bg-gray-50"
                  onClick={handleClick}
                >
                  <div className="w-4 h-4">
                    <SVG className="w-full h-full" src={IconForkOutline} />
                  </div>
                  <div className="flex text-gray-900 text-sm md:text-base font-medium font-inter leading-normal gap-1">
                    <span>Fork</span>
                    <span className="text-gray-400">|</span>
                    <span>2</span>
                  </div>
                </div>
                <div
                  className="relative px-3 py-2 bg-white rounded-md shadow border border-gray-300 justify-center items-center gap-1.5 flex cursor-pointer hover:bg-gray-50"
                  onClick={handleClickCloneDropdown}
                >
                  <div className="w-4 h-4">
                    <SVG className="w-full h-full" src={IconCloneOutline} />
                  </div>
                  <div className="text-gray-900 text-sm md:text-base font-medium font-inter leading-normal flex items-center gap-[2px]">
                    <span>Clone </span>
                    <PiCaretDownBold />
                  </div>
                </div>
                {showCloneDropdown && (
                  <div className="px-4 py-2 z-10 divide-y divide-gray-200 divide-opacity-60 rounded-lg absolute w-96 bg-white right-0 origin-top-right border-[1px] mt-2 top-12 border-gray-300 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)]">
                    <div className="flex flex-col w-full gap-1 py-2">
                      <h3 className="font-medium text-gray-900">Clone</h3>
                      <div className="flex w-full px-2 py-1 gap-1 justify-start items-center border-[0.5px] border-gray-300 bg-gray-200 rounded-md overflow-hidden">
                        <div className="pr-2 overflow-scroll [&::-webkit-scrollbar]:hidden whitespace-nowrap">
                          <div ref={cloneRef} className="text-gray-900 w-full flex">
                            git clone proland://{PL_REPO_ID} protocol-land
                          </div>
                        </div>
                        <div
                          onClick={handleCopyClone}
                          className="text-gray-900 bg-gray-200 hover:bg-gray-300 rounded h-full p-1 cursor-pointer"
                        >
                          <SVG src={IconCloneOutline} className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    <div onClick={handleClick} className="flex px-1 py-2 items-center gap-2 cursor-pointer">
                      <FaRegFileZipper className="w-5 h-5 text-primary-600" />
                      <span className="text-primary-600 font-medium">Download ZIP</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <TransactionId className="block xl:hidden" />
            <div className="self-stretch h-14 flex-col justify-start items-start gap-3 flex">
              <RepoStats />
              <div className="self-stretch text-slate-800 text-xs md:text-sm font-normal font-inter leading-tight">
                Where decentralized protocols roam
              </div>
            </div>
            <RepoTabs />
          </div>
          <div className="self-stretch h-full flex-col justify-start items-center gap-5 flex">
            <div className="self-stretch justify-between md:items-center flex md:flex-row flex-col gap-3">
              <BranchButton />
              <AddFilesButton />
            </div>
            <div className="self-stretch h-full rounded-md border border-gray-300 flex-col justify-start items-start flex">
              <div className="self-stretch px-3 py-2 bg-gray-200 border-b border-gray-300 justify-center items-start gap-3 flex">
                <div className="grow shrink basis-0 text-gray-900 text-xs md:text-sm font-medium font-inter leading-none">
                  File/Folder Name
                </div>
                <div className="grow shrink basis-0 hidden md:block text-gray-900 text-xs md:text-sm font-medium font-inter leading-none">
                  Description
                </div>
                <div className="grow shrink basis-0 text-gray-900 text-xs md:text-sm font-medium font-inter leading-none">
                  Date
                </div>
              </div>
              {files.map((file, idx) => (
                <Row key={`file-${idx}`} item={file} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
