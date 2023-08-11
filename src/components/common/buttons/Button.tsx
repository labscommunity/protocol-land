import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string
}

export default function Button({ text, children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className="px-8 py-2 rounded-[14px] bg-[radial-gradient(circle_at_left_top,rgb(255,0,120),rgb(255,183,32)_100%)] text-white text-base tracking-wide"
    >
      {text || children}
    </button>
  )
}
