local utils      = require('src.utils.mod')
local bint       = require('.bint')(256)

local assertions = require('src.utils.assertions')
local mod        = {}

function mod.depositToLiquidityPool(msg)
    assert(msg.From == CurveDetails.creator, "Only the creator can make liquidity pool requests")
    assert(CurveDetails.liquidityPool == nil, "Liquidity pool already initialized")

    local poolId = msg.Tags['Pool-Id']
    assertions.isAddress('Pool-Id', poolId)

    assert(bint.__lt(bint(0), bint(CurveDetails.reserveBalance)), "Insufficient reserve balance to create liquidity pool")

    local currentSupplyResp = ao.send({ Target = CurveDetails.repoToken.processId, Action = "Total-Supply" }).receive()
        .Data

    if (currentSupplyResp == nil) then
        msg.reply({
            Action = 'Deposit-To-Liquidity-Pool-Error',
            Error = 'Failed to get current supply of curve bonded token'
        })

        return
    end

    local maxSupply = CurveDetails.maxSupply

    if bint.__lt(bint(currentSupplyResp), bint(maxSupply)) then
        msg.reply({
            Action = 'Deposit-To-Liquidity-Pool-Error',
            Error = 'Curve has not reached max supply'
        })

        return
    end

    local tokenADepositResponse = ao.send({
        Target = CurveDetails.repoToken.processId,
        Action = "Transfer",
        Quantity = CurveDetails.allocationForLP,
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
        Target = CurveDetails.reserveToken.processId,
        Action = "Transfer",
        Quantity = CurveDetails.reserveBalance,
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

    CurveDetails.liquidityPool = poolId

    msg.reply({
        Action = 'Deposit-To-Liquidity-Pool-Response',
        ["Pool-Id"] = poolId,
        ["Status"] = "Success"
    })
end

return mod
