import React from 'react'

type MainContentProps = {
  children: React.ReactNode
}

export default function MainContent({ children }: MainContentProps) {
  return <div className="w-[80%] p-8 flex flex-col items-center">{children}</div>
}
