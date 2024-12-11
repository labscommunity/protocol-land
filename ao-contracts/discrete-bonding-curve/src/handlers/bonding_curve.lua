local utils      = require "src.utils.mod"
local aolibs     = require "src.libs.aolibs"
local bint       = require('.bint')(256)
local json       = aolibs.json
local assertions = require 'src.utils.assertions'

local mod        = {}

--- @type table<string, string>
RefundsMap = {}

function RefundHandler(amount, target, pid)
    local refundResp = ao.send({
        Target = pid,
        Action = "Transfer",
        Recipient = target,
        Quantity = tostring(amount),
    }).receive()

    if refundResp.Tags['Action'] ~= 'Debit-Notice' then
        RefundsMap[target] = tostring(amount)
        msg.reply({
            Action = 'Refund-Error',
            Error = 'Refund failed'
        })

        return false
    end

    return true
end

function LogActivity(action, data, msg)
    ao.send({ Target = ao.id, Action = "Activity-Log", ["User-Action"] = action, Data = data, Message = msg })
end

---@type HandlerFunction
function mod.getLastStep(msg)
    msg.reply({
        Action = 'Get-Last-Step-Response',
        StepIdx = tostring(#CurveDetails.steps),
        Data = json.encode(CurveDetails.steps[#CurveDetails.steps])
    })
end

---@type HandlerFunction
function mod.getCurrentStep(msg)
    local currentSupply = msg.Tags['Current-Supply']

    assert(type(currentSupply) == 'string', 'Current supply is required!')
    assert(bint.__lt(0, bint(currentSupply)), 'Current supply must be greater than zero!')


    for idx, step in ipairs(CurveDetails.steps) do
        if bint.__le(bint(currentSupply), bint(step.rangeTo)) then
            msg.reply({
                Action = 'Get-Current-Step-Response',
                StepIdx = tostring(idx),
                Data = json.encode(step)
            })

            return
        end
    end

    msg.reply({
        Action = 'Get-Current-Step-Error',
        Error = 'Current supply is invalid'
    })
end

---@type HandlerFunction
function mod.getPriceForNextBuy(msg)
    -- early return issue
    local currentSupplyResp = ao.send({ Target = CurveDetails.repoToken.processId, Action = "Total-Supply" }).receive()
        .Data
    -- local currentSupplyResp = msg.Tags['X-Current-Supply']
    if (currentSupplyResp == nil) then
        msg.reply({
            Action = 'Buy-Tokens-Error',
            Error = 'Failed to get current supply of curve bonded token'
        })

        return
    end

    currentSupplyResp = tostring(currentSupplyResp)
    local maxSupply = CurveDetails.maxSupply

    if bint.__lt(bint(currentSupplyResp), bint(maxSupply)) then
        currentSupplyResp = utils.add(currentSupplyResp, "1")
    end


    for _, step in ipairs(CurveDetails.steps) do
        if bint.__le(bint(currentSupplyResp), bint(step.rangeTo)) then
            msg.reply({
                Action = 'Get-Price-For-Next-Buy-Response',
                Price = tostring(step.price),
                Data = json.encode(step)
            })

            return
        end
    end

    msg.reply({
        Action = 'Get-Price-For-Next-Buy-Error',
        Error = 'Current supply is invalid'
    })
end

---@type HandlerFunction
function mod.buyTokens(msg)
    LogActivity(msg.Tags['X-Action'], json.encode(msg.Tags), "Buy-Tokens Called")

    local reservePID = msg.From
    local sender = msg.Tags.Sender
    local quantityReservesSent = msg.Tags.Quantity
    -- token quantity is in balance scaled/sub units
    local tokensToBuy = msg.Tags['X-Token-Quantity']
    -- local slippageTolerance = tonumber(msg.Tags["X-Slippage-Tolerance"]) or 0

    assert(type(tokensToBuy) == 'string', 'Token quantity is required!')
    assert(bint.__lt(0, bint(tokensToBuy)), 'Token quantity must be greater than zero!')

    if (CurveDetails.repoToken == nil or CurveDetails.repoToken.processId == nil) then
        msg.reply({
            Action = 'Buy-Tokens-Error',
            Error = 'Bonding curve not initialized'
        })

        return
    end

    -- double call issue
    local currentSupplyResp = ao.send({ Target = CurveDetails.repoToken.processId, Action = "Total-Supply" }).receive()
        .Data
    -- local currentSupplyResp = msg.Tags['X-Current-Supply']
    if (currentSupplyResp == nil) then
        msg.reply({
            Action = 'Buy-Tokens-Error',
            Error = 'Failed to get current supply of curve bonded token'
        })

        return
    end

    currentSupplyResp = tostring(currentSupplyResp)
    local newSupply = utils.add(currentSupplyResp, tokensToBuy)
    local maxSupply = CurveDetails.maxSupply

    if bint.__lt(bint(maxSupply), bint(newSupply)) then
        msg.reply({
            Action = 'Buy-Tokens-Error',
            Error = 'Purchase would exceed maximum supply'
        })

        return
    end

    local tokensLeft = tokensToBuy
    local reserveToBond = '0'
    local supplyLeft;



    for _, step in ipairs(CurveDetails.steps) do
        if bint.__le(bint(currentSupplyResp), bint(step.rangeTo)) then
            supplyLeft = utils.subtract(step.rangeTo, currentSupplyResp)

            if bint.__lt(bint(supplyLeft), bint(tokensLeft)) then
                if bint.__eq(bint(supplyLeft), bint(0)) then
                    goto continue
                end

                reserveToBond = utils.add(reserveToBond, utils.multiply(supplyLeft, step.price))
                currentSupplyResp = utils.add(currentSupplyResp, supplyLeft)
                tokensLeft = utils.subtract(tokensLeft, supplyLeft)
            else
                reserveToBond = utils.add(reserveToBond, utils.multiply(tokensLeft, step.price))
                tokensLeft = '0'

                break;
            end
        end
        ::continue::
    end

    if bint.__eq(bint(reserveToBond), bint(0)) or bint.__lt(0, bint(tokensLeft)) then
        msg.reply({
            Action = 'Buy-Tokens-Error',
            Error = 'Invalid tokens quantity'
        })

        return
    end


    LogActivity(msg.Tags['X-Action'],
        json.encode({ Cost = tostring(reserveToBond), AmountSent = tostring(quantityReservesSent) }),
        "Calculated cost of buying tokens for Reserves sent")
    if bint.__lt(bint(quantityReservesSent), bint(reserveToBond)) then
        LogActivity(msg.Tags['X-Action'],
            json.encode({ Cost = tostring(reserveToBond), AmountSent = tostring(quantityReservesSent) }),
            "Insufficient funds sent to buy")
        local refundSuccess = RefundHandler(quantityReservesSent, sender, reservePID)

        if not refundSuccess then
            LogActivity(msg.Tags['X-Action'],
                json.encode({ Cost = tostring(reserveToBond), AmountSent = tostring(quantityReservesSent) }),
                "Refund failed")
            return
        end

        ao.send({
            Target = sender,
            Action = "Refund-Notice",
            Quantity = tostring(quantityReservesSent),
        })

        msg.reply({
            Cost = tostring(reserveToBond),
            AmountSent = tostring(quantityReservesSent),
            Action = 'Buy-Tokens-Error',
            Error = 'Insufficient funds sent to buy'
        })

        return
    end

    local mintResp = ao.send({ Target = CurveDetails.repoToken.processId, Action = "Mint", Tags = { Quantity = tokensToBuy, Recipient = sender } })
        .receive()

    if mintResp.Tags['Action'] ~= 'Mint-Response' then
        LogActivity(msg.Tags['X-Action'],
            json.encode({ Cost = tostring(reserveToBond), AmountSent = tostring(quantityReservesSent) }),
            "Failed to mint tokens")
        local refundSuccess = RefundHandler(quantityReservesSent, sender, reservePID)

        if not refundSuccess then
            LogActivity(msg.Tags['X-Action'],
                json.encode({ Cost = tostring(reserveToBond), AmountSent = tostring(quantityReservesSent) }),
                "Refund failed after failed mint")
            return
        end

        ao.send({
            Target = sender,
            Action = "Refund-Notice",
            Quantity = tostring(quantityReservesSent),
        })
        msg.reply({
            Action = 'Buy-Tokens-Error',
            Error = 'Failed to mint tokens. Amount will be refunded.'
        })

        return
    end

    CurveDetails.reserveBalance = utils.add(CurveDetails.reserveBalance, quantityReservesSent)


    LogActivity(msg.Tags['X-Action'],
        json.encode({ Cost = tostring(reserveToBond), AmountSent = tostring(quantityReservesSent) }),
        "Successfully bought tokens")

    msg.reply({
        Action = 'Buy-Tokens-Response',
        TokensBought = utils.toBalanceValue(tokensToBuy),
        Cost = tostring(reserveToBond),
        Data = mintResp.Data or ('Successfully bought ' .. tokensToBuy .. ' tokens')
    })
end

---@type HandlerFunction
function mod.sellTokens(msg)
    LogActivity(msg.Tags['Action'], json.encode(msg.Tags), "Sell-Tokens Called")

    local seller = msg.From
    local tokensToSell = msg.Tags['Token-Quantity'] -- in balance scaled/sub units

    assertions.isAddress("From", seller)
    assert(tokensToSell ~= nil, 'Token quantity is required!')
    assert(bint.__lt(0, bint(tokensToSell)), 'Token quantity must be greater than zero!')

    if (CurveDetails.repoToken == nil or CurveDetails.repoToken.processId == nil) then
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Bonding curve not initialized'
        })

        return
    end

    -- double call issue
    local currentSupplyResp = ao.send({ Target = CurveDetails.repoToken.processId, Action = "Total-Supply" }).receive()
        .Data
    -- local currentSupplyResp = msg.Tags['X-Current-Supply']
    if (currentSupplyResp == nil) then
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Failed to get current supply of curve bonded token'
        })

        return
    end

    if bint.__lt(bint(currentSupplyResp), bint(tokensToSell)) then
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Selling tokens would exceed current supply'
        })

        return
    end

    local tokensLeft = tokensToSell
    local reserveFromBond = '0'
    local currentStepIdx = 1

    -- get current step

    for idx, step in ipairs(CurveDetails.steps) do
        if bint.__le(bint(currentSupplyResp), bint(step.rangeTo)) then
            currentStepIdx = idx
            break
        end
    end

    while bint.__lt(bint(0), bint(tokensLeft)) do
        local supplyLeft = currentSupplyResp

        if currentStepIdx > 1 then
            supplyLeft = utils.subtract(currentSupplyResp, CurveDetails.steps[currentStepIdx].rangeTo)
        end

        local tokensToHandle = supplyLeft
        if bint.__lt(bint(tokensLeft), bint(supplyLeft)) then
            tokensToHandle = tokensLeft
        end

        reserveFromBond = utils.add(reserveFromBond, utils.multiply(tokensToHandle, CurveDetails.steps[currentStepIdx].price))
        tokensLeft = utils.subtract(tokensLeft, tokensToHandle)
        currentSupplyResp = utils.subtract(currentSupplyResp, tokensToHandle)

        if currentStepIdx > 1 then
            currentStepIdx = currentStepIdx - 1
        end
    end

    if bint.__lt(bint(0), bint(tokensLeft)) then
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Invalid tokens quantity'
        })

        return
    end

    local burnResp = ao.send({ Target = CurveDetails.repoToken.processId, Action = "Burn", Tags = { Quantity = tokensToSell, Recipient = seller } })
        .receive()
    if burnResp.Tags['Action'] ~= 'Burn-Response' then
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Failed to burn tokens.'
        })

        return
    end

    local transferResp = ao.send({
        Target = CurveDetails.reserveToken.processId,
        Action = "Transfer",
        Recipient = seller,
        Quantity = reserveFromBond
    }).receive()
    if transferResp.Tags['Action'] ~= 'Debit-Notice' then
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Failed to transfer reserve tokens after selling repo tokens.'
        })

        return
    end

    CurveDetails.reserveBalance = utils.subtract(CurveDetails.reserveBalance, reserveFromBond)

    msg.reply({
        Action = 'Sell-Tokens-Response',
        TokensSold = utils.toBalanceValue(tokensToSell),
        Cost = utils.toBalanceValue(reserveFromBond),
        Data = 'Successfully sold ' .. tokensToSell .. ' tokens'
    })
end

return mod
