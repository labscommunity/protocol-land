import ArDB from 'ardb'
import Arweave from 'arweave'

const arweave = new Arweave({
  host: 'ar-io.net',
  port: 443,
  protocol: 'https'
})
const ardb = new ArDB(arweave)

export async function getRepoContributionsCount(repoName: string) {
  try {
    const txs = await ardb
      .search('transactions')
      .appName('Protocol.Land')
      .tags([
        { name: 'Repo', values: [repoName] },
        { name: 'Type', values: ['repo-create', 'stats-commit'] }
      ])
      .findAll()

    return txs.length
  } catch (err) {
    return 0
  }
}
