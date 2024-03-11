type ListProps = {
  href: string
  children: JSX.Element
}

export default function List({ children }: ListProps) {
  return <ul className="text-white my-4 list-disc list-inside [&>li]:py-2 [&>li]:leading-6">{children}</ul>
}
