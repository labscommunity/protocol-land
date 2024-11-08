# pl-bonded-token

AO contract created using [create-ao-contract](https://github.com/pawanpaudel93/create-ao-contract) featuring [Busted](https://luarocks.org/modules/lunarmodules/busted) for testing and seamless deployment via [ao-deploy](https://github.com/pawanpaudel93/ao-deploy).

## Prerequisites

1. Make sure you have [Lua](https://www.lua.org/start.html#installing) and [LuaRocks](https://github.com/luarocks/luarocks/wiki/Download) installed.

2. Install [arweave](https://luarocks.org/modules/crookse/arweave) using LuaRocks for testing purposes.

   ```bash
   luarocks install arweave
   ```

3. **[Recommended]** Install [Lua Language Server](https://luals.github.io/#install) to make development easier, safer, and faster!. On VSCode, install extension: [sumneko.lua](https://marketplace.visualstudio.com/items?itemName=sumneko.lua)
   - Install AO & Busted addon using Lua Addon Manager. On VSCode, goto `View > Command Palette > Lua: Open Addon Manager`

## Usage

To install dependencies:

```bash
npm install
```

To run tests:

```bash
pnpm test
```

To deploy contract:

```bash
pnpm deploy
```
