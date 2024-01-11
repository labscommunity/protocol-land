type HeadingProps = {
  children: any
  level: number
}

export default function Heading({ children, level }: HeadingProps) {
  switch (level) {
    case 1:
      return <h1 className="text-white font-bold font-inter leading-[1.4em] mt-10 text-4xl">{children}</h1>
    case 2:
      return <h2 className="text-white font-bold font-inter leading-[1.4em] mt-10 text-3xl">{children}</h2>
    case 3:
      return <h3 className="text-white font-bold font-inter leading-[1.4em] mt-10 text-2xl">{children}</h3>
    case 4:
      return <h4 className="text-white font-bold font-inter leading-[1.4em] mt-10 text-lg">{children}</h4>
    case 5:
      return <h5 className="text-white font-bold font-inter leading-[1.4em] mt-10 text-base">{children}</h5>
    case 6:
      return <h6 className="text-white font-bold font-inter leading-[1.4em] mt-10 text-sm">{children}</h6>
    default:
      return <div className="text-white font-bold font-inter leading-[1.4em] mt-10 text-base">{children}</div>
  }
}
