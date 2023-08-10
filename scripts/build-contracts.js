import { build } from 'esbuild'
import replace from 'replace-in-file'

const contracts = {
  'repository-contract': './warp/repository/contract.ts'
}

build({
  entryPoints: contracts,
  outdir: './contracts-dist',
  bundle: true,
  format: 'esm'
})
  .catch(() => {
    throw new Error('Failed')
  })
  .finally(() => {
    const files = Object.keys(contracts).map((filename) => {
      return `./contracts-dist/${filename}.js`
    })

    replace.sync({
      files: files,
      from: /async function handle/g,
      to: 'export async function handle',
      countMatches: true
    })

    replace.sync({
      files: files,
      from: [/export {\n {2}handle\n};\n/g],
      to: '',
      countMatches: true
    })
  })
