local bondingCurve = require "src.handlers.bonding_curve"
local tokenManager = require "src.handlers.token_manager"
local liquidityPool = require "src.handlers.liquidity_pool"

tokenManager.initCurve()

Handlers.add('Info', {
        Action = "Info",
    },
    tokenManager.info)

Handlers.add('Get-Last-Step', {
        Action = "Get-Last-Step"
    },
    bondingCurve.getLastStep)

Handlers.add('Get-Current-Step', {
        Action = "Get-Current-Step"
    },
    bondingCurve.getCurrentStep)

Handlers.add('Get-Price-For-Next-Buy', {
        Action = "Get-Price-For-Next-Buy"
    },
    bondingCurve.getPriceForNextBuy)

Handlers.add('Deposit-To-Liquidity-Pool', {
        Action = "Deposit-To-Liquidity-Pool"
    },
    liquidityPool.depositToLiquidityPool)

Handlers.add('Get-Buy-Price', {
        Action = "Get-Buy-Price"
    },
    bondingCurve.getBuyPrice)

Handlers.add('Get-Sell-Price', {
        Action = "Get-Sell-Price"
    },
    bondingCurve.getSellPrice)

Handlers.add(
    "Buy-Tokens",
    { Action = "Credit-Notice", ["X-Action"] = "Buy-Tokens" },
    bondingCurve.buyTokens)

Handlers.add('Sell-Tokens', {
        Action = "Sell-Tokens"
    },
    bondingCurve.sellTokens)
