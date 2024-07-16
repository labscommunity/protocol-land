import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

const Steps = ({ numSteps, stepsComplete }: { numSteps: number; stepsComplete: number }) => {
  const stepArray = Array.from(Array(numSteps).keys())

  return (
    <div
      className={clsx('flex items-center justify-between gap-3', {
        'w-1/2 mx-auto': numSteps === 2
      })}
    >
      {stepArray.map((num) => {
        const stepNum = num + 1
        const isActive = stepNum <= stepsComplete
        return (
          <React.Fragment key={stepNum}>
            <Step num={stepNum} isActive={isActive} />
            {stepNum !== stepArray.length && (
              <div className="w-full h-1 rounded-full bg-gray-200 relative">
                <motion.div
                  className="absolute top-0 bottom-0 left-0 bg-primary-600 rounded-full"
                  animate={{ width: isActive ? '100%' : 0 }}
                  transition={{ ease: 'easeIn', duration: 0.3 }}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const Step = ({ num, isActive }: { num: number; isActive: boolean }) => {
  return (
    <div className="relative">
      <div
        className={`w-10 h-10 flex items-center justify-center shrink-0 border-2 rounded-full font-semibold text-sm relative z-10 transition-colors duration-300 ${
          isActive ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300 text-gray-300'
        }`}
      >
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.svg
              key="icon-marker-check"
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 16 16"
              height="1.6em"
              width="1.6em"
              xmlns="http://www.w3.org/2000/svg"
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              transition={{ duration: 0.125 }}
            >
              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"></path>
            </motion.svg>
          ) : (
            <motion.span
              key="icon-marker-num"
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              transition={{ duration: 0.125 }}
            >
              {num}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {isActive && <div className="absolute z-0 -inset-1.5 bg-primary-100 rounded-full animate-pulse" />}
    </div>
  )
}

export default Steps
