import { Listbox, Transition } from '@headlessui/react'
import { Menu } from '@headlessui/react'
import copyTextToClipboard from '@uiw/copy-to-clipboard'
import clsx from 'clsx'
import { useState } from 'react'
import React from 'react'
import { Fragment } from 'react'
import toast from 'react-hot-toast'
import { AiOutlineCheck } from 'react-icons/ai'
import { BiCodeAlt } from 'react-icons/bi'
import { BsRocketTakeoff } from 'react-icons/bs'
import { FaRegFileZipper } from 'react-icons/fa6'
import { FiChevronDown, FiGitBranch, FiGitCommit, FiGitPullRequest, FiPlus, FiUpload } from 'react-icons/fi'
import { IoCheckmark } from 'react-icons/io5'
import { LuGitBranchPlus } from 'react-icons/lu'
import { PiCaretDownBold } from 'react-icons/pi'
import { VscIssues } from 'react-icons/vsc'
import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'

import IconCloneOutline from '@/assets/icons/clone-outline.svg'
import CodeFileIcon from '@/assets/icons/code-file.svg'
import CodeFolderIcon from '@/assets/icons/code-folder.svg'
import IconCommitOutline from '@/assets/icons/commit-outline.svg'
import IconDriveOutline from '@/assets/icons/drive-outline.svg'
import IconForkOutline from '@/assets/icons/fork-outline.svg'
import IconStarOutline from '@/assets/icons/star-outline.svg'
import LogoLight from '@/assets/pl-logo-light.svg'
import { PL_REPO_ID } from '@/helpers/constants'

const files = [
  { name: 'public', description: 'Bug fixes', date: '12 hours ago', isFolder: true },
  { name: 'scripts', description: 'Bug fixes', date: '12 hours ago', isFolder: true },
  { name: 'src', description: 'Bug fixes', date: '12 hours ago', isFolder: true },
  { name: 'warp/protocol-land', description: 'Bug fixes', date: '12 hours ago', isFolder: true },
  { name: '.gitignore', description: 'Add source files', date: '6 months ago', isFolder: false },
  { name: 'LICENSE.txt', description: 'Add files via upload', date: '8 hours ago', isFolder: false },
  { name: 'README.md', description: 'Update preview', date: '8 hours ago', isFolder: false },
  { name: 'package.json', description: 'Bug fixes', date: '12 hours ago', isFolder: false }
]

const tabs = [
  {
    title: 'Code',
    Icon: BiCodeAlt,
    getPath: (id: string, branchName?: string) =>
      `/repository/${id}${branchName && branchName !== 'master' ? `/tree/${branchName}` : ''}`
  },
  {
    title: 'Issues',
    Icon: VscIssues,
    getPath: (id: string, _?: string) => `/repository/${id}/issues`
  },
  {
    title: 'Commits',
    Icon: FiGitCommit,
    getPath: (id: string, branchName?: string) => `/repository/${id}/commits${branchName ? `/${branchName}` : ''}`
  },
  {
    title: 'Pull Requests',
    Icon: FiGitPullRequest,
    getPath: (id: string, _?: string) => `/repository/${id}/pulls`
  },
  {
    title: 'Forks',
    Icon: FiGitBranch,
    getPath: (id: string, _?: string) => `/repository/${id}/forks`
  },
  {
    title: 'Deployments',
    Icon: BsRocketTakeoff,
    getPath: (id: string, _?: string) => `/repository/${id}/deployments`
  }
]

function Row({ item }: { item: any }) {
  const navigate = useNavigate()

  const Icon = item.isFolder ? CodeFolderIcon : CodeFileIcon

  function handleRowClick() {
    navigate(tabs[0].getPath(PL_REPO_ID))
  }

  return (
    <div
      onClick={handleRowClick}
      className="self-stretch px-3 py-2 border-b border-gray-300 justify-center items-center gap-3 flex bg-gray-50 cursor-pointer hover:bg-primary-50 hover:text-gray-900 last:border-b-0 last:rounded-md text-slate-800 text-xs md:text-sm font-normal font-inter leading-none"
    >
      <SVG src={Icon} className="w-4 h-4" />
      <div className="grow shrink basis-0">{item.name}</div>
      <div className="grow shrink basis-0 hidden md:block">{item.description}</div>
      <div className="grow shrink basis-0">{item.date}</div>
    </div>
  )
}

export default function BranchButton() {
  const navigate = useNavigate()

  function handleClick() {
    navigate(tabs[0].getPath(PL_REPO_ID))
  }

  return (
    <div className="flex items-center gap-4">
      <Listbox value={'development'} onChange={handleClick}>
        <div className="relative">
          <Listbox.Button className="relative h-10 w-[320px] flex justify-between items-center cursor-default rounded-lg bg-white hover:bg-primary-50 hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] text-gray-500 border-[1px] border-gray-300 py-[10px] px-3 text-left focus:outline-none text-md font-medium">
            {({ open }) => (
              <>
                <span className="block truncate">development</span>
                {open && <FiChevronDown className="ml-2 -mr-1 h-5 w-5 rotate-180" aria-hidden="true" />}
                {!open && <FiChevronDown className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />}
              </>
            )}
          </Listbox.Button>
          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-2 w-full max-h-60 overflow-auto rounded-lg bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:outline-none font-medium border-[1px] border-gray-300">
              {['development', 'master'].map((branch, idx) => (
                <Listbox.Option
                  key={idx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-[10px] px-4 ${
                      active ? 'bg-primary-50 text-gray-900' : 'text-gray-700'
                    }`
                  }
                  value={branch}
                >
                  {({ selected }) => (
                    <span>
                      <span
                        className={`flex items-center justify-between truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {branch}
                        <span className="flex items-center">
                          {branch === 'master' && (
                            <span
                              className={`border-[1px] border-primary-600 text-primary-600 rounded-full px-2 text-sm`}
                            >
                              default
                            </span>
                          )}
                          {selected ? (
                            <span className="flex items-center pl-3 text-primary-600">
                              <AiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </span>
                  )}
                </Listbox.Option>
              ))}
              <div
                className="py-4 flex justify-center items-center text-primary-600 cursor-pointer"
                onClick={handleClick}
              >
                <span className="cursor-pointer">View all branches</span>
              </div>
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      <div
        onClick={handleClick}
        className="!px-4 py-[11px] p-2.5 bg-primary-800 hover:bg-primary-900 rounded-md shadow cursor-pointer"
      >
        <LuGitBranchPlus className="w-4 h-4 text-white" />
      </div>
    </div>
  )
}

function AddFilesButton() {
  const navigate = useNavigate()

  function handleClick() {
    navigate(tabs[0].getPath(PL_REPO_ID))
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="px-3 py-2 bg-primary-800 hover:bg-primary-900 rounded-md shadow justify-center items-center gap-1.5 flex">
          <div className="text-white text-sm md:text-base font-medium font-inter leading-normal">Add File</div>
          <PiCaretDownBold className="text-white w-4 h-4" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 md:right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleClick}
                  className={`${
                    active ? 'bg-gray-200' : ''
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`}
                >
                  <FiPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Create new file
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleClick}
                  className={`${
                    active ? 'bg-gray-200' : ''
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`}
                >
                  <FiUpload className="mr-2 h-5 w-5" aria-hidden="true" />
                  Upload files
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

function RepoTabs() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Code')

  function handleTabChange(title: string) {
    const tab = tabs.find((t) => t.title === title)
    if (tab) {
      setActiveTab(tab.title)
      const timeout = setTimeout(() => {
        navigate(tab.getPath(PL_REPO_ID))
        clearTimeout(timeout)
      }, 100)
    }
  }

  return (
    <>
      <div className="w-full border-b border-gray-200 justify-start items-start hidden lg:flex">
        {tabs.map((tab, idx) => (
          <div
            key={`tab-${idx}`}
            className={clsx(
              'px-3 py-2 justify-center items-center gap-1.5 flex cursor-pointer hover:bg-gray-100 hover:rounded-md',
              tab.title === activeTab && 'border-b-2 border-blue-400'
            )}
            onClick={() => handleTabChange(tab.title)}
          >
            <tab.Icon className="w-4 h-4" />
            <div className="text-gray-900 text-sm md:text-base font-medium font-inter leading-normal">{tab.title}</div>
          </div>
        ))}
      </div>
      <div className="w-full block lg:hidden">
        <Listbox value={activeTab} onChange={handleTabChange}>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
              <span className="block truncate">{activeTab}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <PiCaretDownBold className="w-4 h-4" />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm md:text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                {tabs.map((tab, tabIdx) => (
                  <Listbox.Option
                    key={tabIdx}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-gray-200' : ''}`
                    }
                    value={tab.title}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {tab.title}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                            <IoCheckmark className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>
    </>
  )
}

function TransactionId({ className }: { className: string }) {
  return (
    <div className={clsx('text-xs md:text-sm font-normal font-inter leading-tight', className)}>
      <span className="text-slate-600">Transaction ID: </span>
      <span className="text-gray-900">OYL0nXU8UrQm9ekQB7vgXFuvM3LcVDsaSQfQ7-p7u7U</span>
    </div>
  )
}

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
            <SVG className="w-4 h-6 text-primary-600" src={LogoLight} />
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
                  <SVG className="w-4 h-4" src={IconStarOutline} />
                  <div className="text-gray-900 text-sm md:text-base font-medium font-inter leading-normal">10</div>
                </div>
                <div
                  className="px-3 py-2 bg-white rounded-md shadow border border-gray-300 justify-center items-center gap-1.5 flex cursor-pointer hover:bg-gray-50"
                  onClick={handleClick}
                >
                  <SVG className="w-4 h-4" src={IconForkOutline} />
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
                  <SVG className="w-4 h-4" src={IconCloneOutline} />
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
              <div className="justify-start items-start gap-2.5 flex">
                <div className="px-1.5 py-1 bg-gray-200 rounded justify-start items-center gap-1 flex">
                  <SVG className="w-4 h-4" src={IconCommitOutline} />
                  <div className="text-gray-900 text-xs md:text-sm font-normal font-inter leading-tight">
                    175 Commits
                  </div>
                </div>
                <div className="px-1.5 py-1 bg-gray-200 rounded justify-start items-center gap-1 flex">
                  <SVG className="w-4 h-4" src={IconForkOutline} />
                  <div className="text-gray-900 text-xs md:text-sm font-normal font-inter leading-tight">
                    2 Branches
                  </div>
                </div>
                <div className="px-1.5 py-1 bg-gray-200 rounded justify-start items-center gap-1 flex">
                  <SVG className="w-4 h-4" src={IconDriveOutline} />
                  <div className="text-gray-900 text-xs md:text-sm font-normal font-inter leading-tight">4.78 MB</div>
                </div>
              </div>
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
