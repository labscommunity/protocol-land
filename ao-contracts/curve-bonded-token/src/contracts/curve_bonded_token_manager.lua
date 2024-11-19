local bondingCurve = require "src.handlers.bonding_curve"
local tokenManager = require "src.handlers.token_manager"
local liquidityPool = require "src.handlers.liquidity_pool"

Handlers.add('Initialize-Bonding-Curve', Handlers.utils.hasMatchingTag('Action', 'Initialize-Bonding-Curve'),
    tokenManager.initialize)

Handlers.add('Info', Handlers.utils.hasMatchingTag('Action', 'Info'),
    tokenManager.info)

Handlers.add('Get-Buy-Price', Handlers.utils.hasMatchingTag('Action', 'Get-Buy-Price'),
    bondingCurve.getBuyPrice)

Handlers.add('Get-Sell-Price', Handlers.utils.hasMatchingTag('Action', 'Get-Sell-Price'),
    bondingCurve.getSellPrice)

Handlers.add('Sell-Tokens', Handlers.utils.hasMatchingTag('Action', 'Sell-Tokens'),
    bondingCurve.sellTokens)


Handlers.add('Deposit-To-Liquidity-Pool', Handlers.utils.hasMatchingTag('Action', 'Deposit-To-Liquidity-Pool'),
    liquidityPool.depositToLiquidityPool)

Handlers.add(
    "Buy-Tokens",
    { Action = "Credit-Notice", ["X-Action"] = "Buy-Tokens" },
    bondingCurve.buyTokens)
