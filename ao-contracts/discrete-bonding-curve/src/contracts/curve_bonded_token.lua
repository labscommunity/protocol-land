local token = require "src.handlers.token"
local balance = require "src.handlers.balance"
local transfer = require "src.handlers.transfer"
local mint = require "src.handlers.mint"
local burn = require "src.handlers.burn"

-- Info
Handlers.add('Info', Handlers.utils.hasMatchingTag('Action', 'Info'), token.info)

-- Total Supply
Handlers.add('Total-Supply', Handlers.utils.hasMatchingTag('Action', "Total-Supply"), token.totalSupply)

-- Max Supply
Handlers.add('Max-Supply', Handlers.utils.hasMatchingTag('Action', "Max-Supply"), token.maxSupply)

-- Balance
Handlers.add('Balance', Handlers.utils.hasMatchingTag('Action', 'Balance'), balance.balance)

-- Balances
Handlers.add('Balances', Handlers.utils.hasMatchingTag('Action', 'Balances'), balance.balances)

-- Transfer
Handlers.add('Transfer', Handlers.utils.hasMatchingTag('Action', 'Transfer'), transfer.transfer)

-- Mint
Handlers.add('Mint', Handlers.utils.hasMatchingTag('Action', 'Mint'), mint.mint)

-- Burn
Handlers.add('Burn', Handlers.utils.hasMatchingTag('Action', 'Burn'), burn.burn)
