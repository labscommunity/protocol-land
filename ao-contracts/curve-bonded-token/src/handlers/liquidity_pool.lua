local utils = require('src.utils.mod')
local mod = {}

function mod.depositToLiquidityPool(msg)
    assert(msg.From == Creator, "Only the creator can make liquidity pool requests")
    assert(LiquidityPool == nil, "Liquidity pool already initialized")
    assert(ReachedFundingGoal == true, "Funding goal not reached")

    local poolId = msg.Tags['Pool-Id']
    assert(type(poolId) == 'string', "Pool ID is required")

    -- local mintQty = utils.divide(utils.multiply(MaxSupply, "20"), "100")
    local mintResponse = ao.send({
        Target = RepoToken.processId, Action = "Mint", Quantity = AllocationForLP
    }).receive()

    if mintResponse.Tags['Action'] ~= 'Mint-Response' then
        msg.reply({
            Action = 'Deposit-To-Liquidity-Pool-Error',
            Error = 'Failed to mint tokens.'
        })

        return
    end

    local balanceResponseRepoToken = ao.send({
        Target = RepoToken.processId, Action = "Balance"
    }).receive()

    local tokenAQty = balanceResponseRepoToken.Data

    if tokenAQty == nil or tokenAQty == "0" then
        msg.reply({
            Action = 'Deposit-To-Liquidity-Pool-Error',
            Error = "No repo tokens to deposit",
        })
        return
    end

    local balanceResponseReserveToken = ao.send({
        Target = ReserveToken.processId, Action = "Balance"
    }).receive()

    local tokenBQty = balanceResponseReserveToken.Data

    if tokenBQty == nil or tokenBQty == "0" then
        msg.reply({
            Action = 'Deposit-To-Liquidity-Pool-Error',
            Error = "No reserve tokens to deposit",
        })
        return
    end

    local tokenADepositResponse = ao.send({
        Target = RepoToken.processId,
        Action = "Transfer",
        Quantity = tokenAQty,
        Recipient = poolId,
        ["X-Action"] = "Provide",
        ["X-Slippage-Tolerance"] = "0.5"
    }).receive()

    if tokenADepositResponse.Tags['Action'] ~= 'Debit-Notice' then
        msg.reply({
            Action = 'Deposit-To-Liquidity-Pool-Error',
            Error = 'Failed to transfer Repo tokens to LP. try again.'
        })

        return
    end

    local tokenBDepositResponse = ao.send({
        Target = ReserveToken.processId,
        Action = "Transfer",
        Quantity = tokenBQty,
        Recipient = poolId,
        ["X-Action"] = "Provide",
        ["X-Slippage-Tolerance"] = "0.5"
    }).receive()

    if tokenBDepositResponse.Tags['Action'] ~= 'Debit-Notice' then
        msg.reply({
            Action = 'Deposit-To-Liquidity-Pool-Error',
            Error = 'Failed to transfer Repo tokens to LP. try again.'
        })

        return
    end

    LiquidityPool = poolId

    --Check reserves of the pool

    msg.reply({
        Action = 'Deposit-To-Liquidity-Pool-Response',
        ["Pool-Id"] = poolId,
        ["Status"] = "Success"
    })
end

return mod
