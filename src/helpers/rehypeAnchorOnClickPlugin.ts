import { Element } from 'hast'
import { visit } from 'unist-util-visit'

// Define a type for the properties that may be on an Element node
interface ElementProperties {
  href?: string
  onClick?: (e: MouseEvent) => void
}

export const onNode = (node: Element) => {
  // Ensure that the node is an anchor ('a') element with a href property that is a string
  if (node.tagName !== 'a' || typeof (node.properties as ElementProperties)?.href !== 'string') return

  // Since we've narrowed the type of node.properties, we can assert its type here
  const properties = node.properties as ElementProperties
  const url = properties.href

  // Skip processing for non-anchor links
  if (!url || !url.startsWith('#')) return

  node.properties = { ...node.properties, href: 'javascript:void(0)' }

  const element = document.querySelector(url)?.children?.[0]
  if (!element) return
  ;(element as any).onclick = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // @ts-ignore
    element.style.scrollMargin = '60px'
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

export default function rehypeAnchorOnClick() {
  return (tree: any) => visit(tree, 'element', onNode)
}
