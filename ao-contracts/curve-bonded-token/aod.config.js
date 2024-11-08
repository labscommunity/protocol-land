import { defineConfig } from "ao-deploy";

export default defineConfig({
  "curve-bonded-token": {
    name: "curve-bonded-token",
    contractPath: "src/contracts/curve_bonded_token.lua",
    luaPath: "./src/?.lua",
  },
  "curve-bonded-token-manager": {
    name: "curve-bonded-token-manager",
    contractPath: "src/contracts/curve_bonded_token_manager.lua",
    luaPath: "./src/?.lua",
  },
});
