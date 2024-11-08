local utils  = require "src.utils.mod"
local aolibs = require "src.libs.aolibs"
local bint   = require('.bint')(256)
local json   = aolibs.json

local mod    = {}

--[[
--- Get price for purchasing tokenQuantity of tokens
--]]
local EXP_N = 2 -- exponent determining the rate of increase
local EXP_N_PLUS1 = EXP_N + 1

--- @type table<string, string>
RefundsMap = {}


function GetCurrentSupply()
    Send({ Target = RepoToken.processId, Action = "Total-Supply" })
    local currentSupplyResp = Receive(
        function(m)
            return m.Tags['From-Process'] == RepoToken.processId and
                m.Tags['Action'] == 'Total-Supply-Response'
        end)

    return currentSupplyResp.Data
end

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
function mod.getBuyPrice(msg)
    local tokensToBuy = msg.Tags['Token-Quantity']
    local currentSupply = msg.Tags['Current-Supply']
    assert(type(tokensToBuy) == 'string', 'Token quantity is required!')

    local tokensToBuyInSubUnits = utils.toSubUnits(tokensToBuy, RepoToken.denomination)
    assert(bint.__lt(0, tokensToBuyInSubUnits), 'Token quantity must be greater than zero!')

    if (Initialized ~= true or RepoToken == nil or RepoToken.processId == nil) then
        msg.reply({
            Action = 'Get-Buy-Price-Error',
            Error = 'Bonding curve not initialized'
        })

        return
    end
    if (currentSupply == nil) then
        msg.reply({
            Action = 'Get-Buy-Price-Error',
            Error = 'Failed to get current supply of curve bonded token'
        })

        return
    end

    -- current supply is returned in sub units
    -- local preAllocation = utils.add(AllocationForLP, AllocationForCreator)
    local s1 = currentSupply
    local s2 = utils.add(currentSupply, tokensToBuyInSubUnits);

    if bint.__lt(bint(SupplyToSell), bint(s2)) then
        local diff = utils.subtract(SupplyToSell, currentSupply)
        msg.reply({
            Action = 'Get-Buy-Price-Error',
            Error = 'Not enough tokens to sell. Remaining: ' .. diff
        })

        return
    end

    local S_exp = bint.ipow(bint(SupplyToSell), bint(EXP_N_PLUS1))

    if bint.__le(S_exp, 0) then
        msg.reply({
            Action = 'Get-Buy-Price-Error',
            Error = 'Bonding curve error: S_EXP too low ' .. S_exp
        })

        return
    end

    -- Cost = G * [ (s2)^(n+1) - (s1)^(n+1) ] / S^(n+1)
    local s1_exp = bint.ipow(bint(s1), bint(EXP_N_PLUS1))
    local s2_exp = bint.ipow(bint(s2), bint(EXP_N_PLUS1))

    local numerator = utils.multiply(FundingGoal, utils.subtract(s2_exp, s1_exp))
    local cost = utils.divide(numerator, S_exp)

    msg.reply({
        Action = 'Get-Buy-Price-Response',
        Price = cost,
        CurrentSupply = currentSupply,
        TokensToBuy = tokensToBuy,
        Data = cost,
        Denomination = ReserveToken.denomination,
        Ticker = ReserveToken.tokenTicker
    })
end

--[[
--- Get price for selling tokenQuantity of tokens
---
--]]
---@type HandlerFunction
function mod.getSellPrice(msg)
    local tokensToSell = msg.Tags['Token-Quantity']
    assert(type(tokensToSell) == 'string', 'Token quantity is required!')

    if bint.__le(bint(ReserveBalance), 0) then
        msg.reply({
            Action = 'Get-Sell-Price-Error',
            Error = 'No reserve balance to sell!'
        })

        return
    end

    local tokensToSellInSubUnits = utils.toSubUnits(tokensToSell, RepoToken.denomination)
    assert(bint.__lt(0, tokensToSellInSubUnits), 'Token quantity must be greater than zero!')

    if (Initialized ~= true or RepoToken == nil or RepoToken.processId == nil) then
        msg.reply({
            Action = 'Get-Sell-Price-Error',
            Error = 'Bonding curve not initialized'
        })

        return
    end

    ao.send({ Target = RepoToken.processId, Action = "Total-Supply" })
    local currentSupplyResp = Receive(
        function(m)
            return m.Tags['From-Process'] == RepoToken.processId and
                m.Data ~= nil
        end)

    if (currentSupplyResp == nil or currentSupplyResp.Data == nil) then
        msg.reply({
            Action = 'Get-Sell-Price-Error',
            Error = 'Failed to get current supply of curve bonded token'
        })

        return
    end

    -- current supply is returned in sub units
    local preAllocation = utils.add(AllocationForLP, AllocationForCreator)
    local s1 = utils.subtract(currentSupplyResp.Data, preAllocation)
    local s2 = utils.subtract(s1, tokensToSellInSubUnits);

    local S_exp = bint.ipow(bint(SupplyToSell), bint(EXP_N_PLUS1))

    if bint.__le(S_exp, 0) then
        msg.reply({
            Action = 'Get-Sell-Price-Error',
            Error = 'Bonding curve error: S_EXP too low ' .. S_exp
        })

        return
    end

    -- Cost = G * [ (s2)^(n+1) - (s1)^(n+1) ] / S^(n+1)
    local s1_exp = bint.ipow(bint(s1), bint(EXP_N_PLUS1))
    local s2_exp = bint.ipow(bint(s2), bint(EXP_N_PLUS1))

    local numerator = utils.multiply(FundingGoal, utils.subtract(s2_exp, s1_exp))
    local cost = utils.divide(numerator, S_exp)

    if bint.__lt(bint(cost), bint(ReserveBalance)) then
        msg.reply({
            Action = 'Get-Sell-Price-Error',
            Error = 'Bonding curve error: Insufficient reserve balance to sell: ' .. cost
        })

        return
    end

    msg.reply({
        Action = 'Get-Sell-Price-Response',
        Price = cost,
        Data = cost,
        Denomination = ReserveToken.denomination,
        Ticker = ReserveToken.tokenTicker
    })
end

---@type HandlerFunction
function mod.buyTokens(msg, env)
    LogActivity(msg.Tags['X-Action'], json.encode(msg.Tags), "Buy-Tokens Called")
    local reservePID = msg.From

    local sender = msg.Tags.Sender

    local quantityReservesSent = bint(msg.Tags.Quantity)

    -- local slippageTolerance = tonumber(msg.Tags["X-Slippage-Tolerance"]) or 0

    assert(ReachedFundingGoal == false, 'Funding goal has been reached!')

    local tokensToBuy = msg.Tags['X-Token-Quantity']
    assert(type(tokensToBuy) == 'string', 'Token quantity is required!')

    local tokensToBuyInSubUnits = utils.toSubUnits(tokensToBuy, RepoToken.denomination)
    assert(bint.__lt(0, tokensToBuyInSubUnits), 'Token quantity must be greater than zero!')

    if (Initialized ~= true or RepoToken == nil or RepoToken.processId == nil) then
        msg.reply({
            Action = 'Buy-Tokens-Error',
            Error = 'Bonding curve not initialized'
        })

        return
    end

    -- double call issue
    local currentSupplyResp = ao.send({ Target = RepoToken.processId, Action = "Total-Supply" }).receive()
    -- local currentSupplyResp = msg.Tags['X-Current-Supply']
    if (currentSupplyResp == nil or currentSupplyResp.Data == nil) then
        msg.reply({
            Action = 'Buy-Tokens-Error',
            Error = 'Failed to get current supply of curve bonded token'
        })

        return
    end

    -- current supply is returned in sub units
    -- local preAllocation = utils.add(AllocationForLP, AllocationForCreator)
    local s1 = currentSupplyResp.Data
    local s2 = utils.add(currentSupplyResp.Data, tokensToBuyInSubUnits);
    -- Calculate remaining tokens
    local remainingTokens = utils.subtract(SupplyToSell, currentSupplyResp.Data)

    -- Check if there are enough tokens to sell
    if bint.__lt(bint(remainingTokens), bint(tokensToBuyInSubUnits)) then
        msg.reply({
            Action = 'Buy-Tokens-Error',
            Remaining = tostring(remainingTokens),
            TokensToBuy = tostring(tokensToBuyInSubUnits),
            Error = 'Not enough tokens to sell.'
        })
        return
    end

    local S_exp = bint.ipow(bint(SupplyToSell), bint(EXP_N_PLUS1))

    if bint.__le(S_exp, 0) then
        msg.reply({
            Action = 'Buy-Tokens-Error',
            Error = 'Bonding curve error: S_EXP too low ' .. S_exp
        })

        return
    end

    -- Cost = G * [ (s2)^(n+1) - (s1)^(n+1) ] / S^(n+1)
    local s1_exp = bint.ipow(bint(s1), bint(EXP_N_PLUS1))
    local s2_exp = bint.ipow(bint(s2), bint(EXP_N_PLUS1))

    local numerator = utils.multiply(FundingGoal, utils.subtract(s2_exp, s1_exp))
    local cost = utils.divide((numerator), S_exp)
    LogActivity(msg.Tags['X-Action'], json.encode({ Cost = tostring(cost), AmountSent = tostring(quantityReservesSent) }),
        "Calculated cost of buying tokens for Reserves sent")
    if bint.__lt(bint(quantityReservesSent), bint(cost)) then
        LogActivity(msg.Tags['X-Action'],
            json.encode({ Cost = tostring(cost), AmountSent = tostring(quantityReservesSent) }),
            "Insufficient funds sent to buy")
        local refundSuccess = RefundHandler(quantityReservesSent, sender, reservePID)

        if not refundSuccess then
            LogActivity(msg.Tags['X-Action'],
                json.encode({ Cost = tostring(cost), AmountSent = tostring(quantityReservesSent) }),
                "Refund failed")
            return
        end

        ao.send({
            Target = sender,
            Action = "Refund-Notice",
            Quantity = tostring(quantityReservesSent),
        })

        msg.reply({
            Cost = tostring(cost),
            AmountSent = tostring(quantityReservesSent),
            Action = 'Buy-Tokens-Error',
            Error = 'Insufficient funds sent to buy'
        })

        return
    end

    local mintResp = ao.send({ Target = RepoToken.processId, Action = "Mint", Tags = { Quantity = utils.toBalanceValue(tokensToBuyInSubUnits), Recipient = sender } })
        .receive()

    if mintResp.Tags['Action'] ~= 'Mint-Response' then
        LogActivity(msg.Tags['X-Action'],
            json.encode({ Cost = tostring(cost), AmountSent = tostring(quantityReservesSent) }),
            "Failed to mint tokens")
        local refundSuccess = RefundHandler(quantityReservesSent, sender, reservePID)

        if not refundSuccess then
            LogActivity(msg.Tags['X-Action'],
                json.encode({ Cost = tostring(cost), AmountSent = tostring(quantityReservesSent) }),
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

    ReserveBalance = utils.add(ReserveBalance, quantityReservesSent)
    if bint(ReserveBalance) >= bint(FundingGoal) then
        ReachedFundingGoal = true
    end

    LogActivity(msg.Tags['X-Action'], json.encode({ Cost = tostring(cost), AmountSent = tostring(quantityReservesSent) }),
        "Successfully bought tokens")

    msg.reply({
        Action = 'Buy-Tokens-Response',
        TokensBought = utils.toBalanceValue(tokensToBuyInSubUnits),
        Cost = tostring(cost),
        Data = mintResp.Data or ('Successfully bought ' .. tokensToBuy .. ' tokens')
    })
end

---@type HandlerFunction
function mod.sellTokens(msg)
    LogActivity(msg.Tags['Action'], json.encode(msg.Tags), "Sell-Tokens Called")
    assert(ReachedFundingGoal == false, 'Funding goal has been reached!')

    local tokensToSell = msg.Tags['Token-Quantity']
    assert(type(tokensToSell) == 'string', 'Token quantity is required!')

    if bint.__le(bint(ReserveBalance), 0) then
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'No reserve balance to sell!'
        })

        return
    end

    local tokensToSellInSubUnits = utils.toSubUnits(tokensToSell, RepoToken.denomination)
    assert(bint.__lt(0, tokensToSellInSubUnits), 'Token quantity must be greater than zero!')

    if (Initialized ~= true or RepoToken == nil or RepoToken.processId == nil) then
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Bonding curve not initialized'
        })

        return
    end

    local currentSupplyResp = ao.send({ Target = RepoToken.processId, Action = "Total-Supply" }).receive()
    if (currentSupplyResp == nil or currentSupplyResp.Data == nil) then
        msg.reply({
            Action = 'Get-Sell-Price-Error',
            Error = 'Failed to get current supply of curve bonded token'
        })

        return
    end

    if bint.__le(bint(currentSupplyResp.Data), 0) then
        LogActivity(msg.Tags['Action'],
            json.encode({ CurrentSupply = currentSupplyResp.Data, TokensToSell = tokensToSell }),
            "No tokens to sell. Buy some tokens first.")
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'No tokens to sell. Buy some tokens first.'
        })

        return
    end

    -- Check if there are enough tokens to sell
    if bint.__lt(bint(currentSupplyResp.Data), bint(tokensToSellInSubUnits)) then
        LogActivity(msg.Tags['Action'],
            json.encode({ CurrentSupply = currentSupplyResp.Data, TokensToSell = tostring(tokensToSellInSubUnits) }),
            "Not enough tokens to sell.")
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Not enough tokens to sell.'
        })
        return
    end

    -- current supply is returned in sub units
    -- local preAllocation = utils.add(AllocationForLP, AllocationForCreator)
    local s1 = currentSupplyResp.Data
    local s2 = utils.subtract(currentSupplyResp.Data, tokensToSellInSubUnits);

    local S_exp = bint.ipow(bint(SupplyToSell), bint(EXP_N_PLUS1))

    if bint.__le(S_exp, 0) then
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Bonding curve error: S_EXP too low ' .. S_exp
        })

        return
    end

    -- Cost = G * [ (s2)^(n+1) - (s1)^(n+1) ] / S^(n+1)
    local s1_exp = bint.ipow(bint(s1), bint(EXP_N_PLUS1))
    local s2_exp = bint.ipow(bint(s2), bint(EXP_N_PLUS1))

    local numerator = utils.multiply(FundingGoal, utils.subtract(s1_exp, s2_exp))
    local cost = utils.divide(numerator, S_exp)

    LogActivity(msg.Tags['Action'],
        json.encode({
            Proceeds = tostring(cost),
            CurrentSupply = currentSupplyResp.Data,
            TokensToSell = tostring(
                tokensToSellInSubUnits)
        }), "Calculated cost of selling tokens")

    local balanceResp = ao.send({ Target = ReserveToken.processId, Action = "Balance" }).receive()
    if balanceResp == nil or balanceResp.Data == nil then
        LogActivity(msg.Tags['Action'],
            json.encode({
                Proceeds = tostring(cost),
                CurrentSupply = currentSupplyResp.Data,
                TokensToSell = tostring(
                    tokensToSellInSubUnits)
            }),
            "Failed to get balance of reserve token")
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Failed to get balance of reserve token'
        })

        return
    end
    LogActivity(msg.Tags['Action'], json.encode({ Balance = balanceResp.Data }), "Got balance of reserve token")

    if bint.__lt(bint(balanceResp.Data), bint(ReserveBalance)) then
        LogActivity(msg.Tags['Action'],
            json.encode({
                Proceeds = tostring(cost),
                CurrentSupply = currentSupplyResp.Data,
                TokensToSell = tostring(
                    tokensToSellInSubUnits),
                Balance = balanceResp.Data,
                ReserveBalance = ReserveBalance
            }),
            "Insufficient reserve balance to sell")
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Insufficient reserve balance to sell',
            ReserveBalance = tostring(ReserveBalance),
            CurrentBalance = tostring(balanceResp.Data)
        })

        return
    end

    if bint.__lt(bint(ReserveBalance), bint(cost)) then
        LogActivity(msg.Tags['Action'],
            json.encode({
                Proceeds = tostring(cost),
                CurrentSupply = currentSupplyResp.Data,
                TokensToSell = tostring(
                    tokensToSellInSubUnits),
                Balance = balanceResp.Data,
                ReserveBalance = ReserveBalance
            }),
            "Insufficient reserve balance to sell")
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Insufficient reserve balance to sell',
            ReserveBalance = tostring(ReserveBalance),
            Cost = tostring(cost)
        })

        return
    end

    local burnResp = ao.send({ Target = RepoToken.processId, Action = "Burn", Tags = { Quantity = tostring(tokensToSellInSubUnits), Recipient = msg.From } })
        .receive()
    if burnResp.Tags['Action'] ~= 'Burn-Response' then
        LogActivity(msg.Tags['Action'],
            json.encode({
                Proceeds = tostring(cost),
                CurrentSupply = currentSupplyResp.Data,
                TokensToSell = tostring(
                    tokensToSellInSubUnits),
                Balance = balanceResp.Data,
                ReserveBalance = ReserveBalance
            }),
            "Failed to burn tokens")
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Failed to burn tokens. Amount will be refunded.'
        })

        return
    end

    local transferResp = ao.send({
        Target = ReserveToken.processId,
        Action = "Transfer",
        Recipient = msg.From,
        Quantity =
            tostring(cost)
    }).receive()
    if transferResp.Tags['Action'] ~= 'Debit-Notice' then
        LogActivity(msg.Tags['Action'],
            json.encode({
                Proceeds = tostring(cost),
                CurrentSupply = currentSupplyResp.Data,
                TokensToSell = tostring(
                    tokensToSellInSubUnits),
                Balance = balanceResp.Data,
                ReserveBalance = ReserveBalance
            }),
            "Failed to transfer reserve tokens")
        RefundsMap[msg.From] = tostring(cost)
        msg.reply({
            Action = 'Sell-Tokens-Error',
            Error = 'Failed to transfer reserve tokens. try again.'
        })

        return
    end

    ReserveBalance = utils.subtract(ReserveBalance, cost)



    LogActivity(msg.Tags['Action'],
        json.encode({
            Proceeds = tostring(cost),
            CurrentSupply = currentSupplyResp.Data,
            TokensToSell = tostring(tokensToSellInSubUnits),
            Balance = balanceResp.Data,
            ReserveBalance = ReserveBalance
        }),
        "Successfully sold tokens")
    msg.reply({
        Action = 'Sell-Tokens-Response',
        TokensSold = utils.toBalanceValue(tokensToSellInSubUnits),
        Cost = tostring(cost),
        Data = 'Successfully sold ' .. tokensToSell .. ' tokens'
    })
end

return mod
