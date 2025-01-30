import { defineConfig } from 'ao-deploy'

export default defineConfig({
  curve_bonded_token: {
    name: 'curve_bonded_token',
    contractPath: 'src/contracts/curve_bonded_token.lua',
    luaPath: './src/?.lua',
    outDir: './dist'
  },
  curve_bonded_token_manager: {
    name: 'curve_bonded_token_manager',
    contractPath: 'src/contracts/curve_bonded_token_manager.lua',
    luaPath: './src/?.lua',
    outDir: './dist'
  },
  launcher: {
    name: 'launcher',
    contractPath: 'src/contracts/launcher.lua',
    luaPath: './src/?.lua',
    outDir: './dist'
  }
})
