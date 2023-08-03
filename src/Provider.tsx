import { ChakraProvider } from '@chakra-ui/react'
import React from 'react'

export default function Provider({ children }: { children: React.JSX.Element }) {
  return <ChakraProvider>{children}</ChakraProvider>
}
