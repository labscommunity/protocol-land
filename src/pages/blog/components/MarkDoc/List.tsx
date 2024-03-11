type ListProps = {
  href: string
  children: JSX.Element
}

export default function List({ children }: ListProps) {
  return <ol className="text-white my-4 hover:underline list-decimal list-inside [&>li]:py-1">{children}</ol>
}
