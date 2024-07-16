import React from 'react'

export default function useStepper(numSteps: number = 4) {
  const [stepsComplete, setStepsComplete] = React.useState(0)

  const handleSetStep = (num: number) => {
    if ((stepsComplete === 0 && num === -1) || (stepsComplete === numSteps && num === 1)) {
      return
    }

    setStepsComplete((pv) => pv + num)
  }
  return { handleSetStep, stepsComplete, numSteps }
}
