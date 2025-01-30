import fs from 'fs'
import path from 'path'

const contractsToBuild = ['curve_bonded_token', 'curve_bonded_token_manager']

const buildDir = './dist'
const fileNames = contractsToBuild.map((key) => `${key}.lua`)

const factoryFileName = 'launcher.lua'

const contractSources = {}

for (const fileName of fileNames) {
  const filePath = path.join(buildDir, fileName)
  const source = fs.readFileSync(filePath, 'utf8')
  const varName = fileName.replace('.lua', '').toUpperCase()
  contractSources[varName] = `${varName}_SRC = [[${source}]]`
}

const sourceCode = Object.entries(contractSources)
  .map(([, source]) => source)
  .join('\n\n')

const factoryPath = path.join(buildDir, factoryFileName)
const existingCode = fs.existsSync(factoryPath) ? fs.readFileSync(factoryPath, 'utf8') : ''

fs.writeFileSync(factoryPath, sourceCode + '\n\n' + existingCode)
