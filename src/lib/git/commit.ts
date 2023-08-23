import git from 'isomorphic-git'

import { FSType } from './helpers/fsWithName'

export async function getAllCommits({ fs, dir }: CommonCommitOptions) {
  return await git.log({ fs, dir })
}

type CommonCommitOptions = {
  fs: FSType
  dir: string
}
