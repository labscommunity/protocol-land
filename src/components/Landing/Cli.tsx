import copyTextToClipboard from '@uiw/copy-to-clipboard'
import { useState } from 'react'
import { FiArrowUpRight } from 'react-icons/fi'
import { IoCheckmarkSharp } from 'react-icons/io5'
import { PiCopy } from 'react-icons/pi'

import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { openInNewTab } from '@/helpers/openInNewTab'

export default function Cli() {
  const [isCopied, setIsCopied] = useState(false)

  function copyCommand() {
    copyTextToClipboard('npm install --global @protocol.land/git-remote-helper', (_isCopied) => {
      if (_isCopied) {
        setIsCopied(_isCopied)
        const timeout = setTimeout(() => {
          setIsCopied(false)
          clearTimeout(timeout)
        }, 1000)
      }
    })
    trackGoogleAnalyticsEvent('Landing', 'Copy CLI install command button click', 'Copy CLI command Button')
  }

  return (
    <div className="w-full py-16 md:py-[60px] flex-col justify-center items-center gap-10 inline-flex">
      <div className="self-stretch px-[10px] lg:px-[60px] justify-center items-center inline-flex">
        <div className="grow shrink basis-0 flex lg:bg-[url('/cli-background.svg')] bg-no-repeat bg-right">
          <div
            className="grow shrink basis-0 p-5 md:px-10 lg:px-20 xl:py-[60px] md:py-[60px] rounded-3xl border border-primary-500 flex-col justify-center items-center gap-7 inline-flex"
            style={{
              background: 'linear-gradient(180deg, rgba(56, 124, 158, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%)'
            }}
          >
            <div className="flex-col justify-start items-center gap-4 flex">
              <div className="text-center text-white text-3xl md:text-5xl font-bold font-lekton leading-10">
                Install the Protocol.Land CLI
              </div>
            </div>
            <div className="flex flex-col items-start justify-center w-full gap-2">
              <div className="w-full px-4 md:px-10 py-5 bg-white rounded-lg justify-between items-center inline-flex">
                <div className="text-center text-black text-xs md:text-xl font-normal font-inter leading-none md:leading-normal">
                  npm install --global @protocol.land/git-remote-helper
                </div>
                <div className="flex h-7 justify-center items-center">
                  <div className="w-7 rotate-90 border-2 border-black"></div>
                  <div
                    className="relative w-8 h-8 flex justify-center items-center cursor-pointer hover:bg-gray-100 rounded"
                    onClick={copyCommand}
                  >
                    {!isCopied ? (
                      <PiCopy className="w-6 h-6" />
                    ) : (
                      <IoCheckmarkSharp className="w-6 h-6 text-green-600" />
                    )}
                    {isCopied && (
                      <div className="absolute bg-gray-300 w-fit px-2 rounded right-10 md:left-10">Copied!</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-center text-white text-xs md:text-base font-normal font-inter leading-none md:leading-tight">
                Ensure that you have npm installed on your device before installing Protocol.Land CLI
              </div>
            </div>
            <div className="justify-center items-center inline-flex cursor-pointer">
              <div
                className="text-center text-white text-sm md:text-xl font-bold font-inter leading-none md:leading-normal hover:underline hover:text-primary-600 flex items-center"
                onClick={() => openInNewTab('https://github.com/labscommunity/protocol-land-remote-helper')}
              >
                Install Guide <FiArrowUpRight className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
