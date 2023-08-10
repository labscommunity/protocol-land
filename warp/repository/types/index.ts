export type RepositoryState = {
  title: string
  description: string
  owner: string
  contributors: string[]
}

export type RepositoryAction = {
  input: RepositoryInput
  caller: string
}

export type RepositoryInput = {
  function: RepositoryFunction
  payload: any
}

export type RepositoryFunction = 'initialize' | 'commit' // more types will be added later

export type ContractResult = { state: RepositoryState } | { result: number }
