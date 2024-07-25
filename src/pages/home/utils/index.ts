import ArDB from 'ardb'
import Arweave from 'arweave'

const arweave = new Arweave({
  host: 'ar-io.net',
  port: 443,
  protocol: 'https'
})
export const ardb = new ArDB(arweave)

export async function getRepoContributionsCount(repoName: string) {
  try {
    const txs = await ardb
      .search('transactions')
      .appName('Protocol.Land')
      .tags([
        { name: 'Repo', values: [repoName] },
        { name: 'Type', values: ['stats-commit'] }
      ])
      .findAll()
    // +1 for repo-create
    return txs.length + 1
  } catch (err) {
    return 1
  }
}
