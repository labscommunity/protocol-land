-- module: "src.utils.mod"
local function _loaded_mod_src_utils_mod()
    local bint = require('.bint')(256)
    
    local utils = {
        add = function(a, b)
            return tostring(bint(a) + bint(b))
        end,
        subtract = function(a, b)
            return tostring(bint(a) - bint(b))
        end,
        multiply = function(a, b)
            return tostring(bint(a) * bint(b))
        end,
        divide = function(a, b)
            return tostring(bint.udiv(bint(a), bint(b)))
        end,
        toBalanceValue = function(a)
            return tostring(bint(a))
        end,
        toNumber = function(a)
            return tonumber(a)
        end,
        toSubUnits = function(val, denom)
            return bint(val) * bint.ipow(bint(10), bint(denom))
        end
    }
    
    return utils
    
  end
  
  _G.package.loaded["src.utils.mod"] = _loaded_mod_src_utils_mod()
  
  -- module: "src.libs.aolibs"
  local function _loaded_mod_src_libs_aolibs()
    -- These libs should exist in ao
    
    local mod = {}
    
    -- Define json
    
    local cjsonstatus, cjson = pcall(require, "cjson")
    
    if cjsonstatus then
        mod.json = cjson
    else
        local jsonstatus, json = pcall(require, "json")
        if not jsonstatus then
            error("Library 'json' does not exist")
        else
            mod.json = json
        end
    end
    
    return mod
  end
  
  _G.package.loaded["src.libs.aolibs"] = _loaded_mod_src_libs_aolibs()
  
  -- module: "src.handlers.bonding_curve"
  local function _loaded_mod_src_handlers_bonding_curve()
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
        local preAllocation = utils.add(AllocationForLP, AllocationForCreator)
        local s1 = utils.subtract(currentSupply, preAllocation)
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
        local preAllocation = utils.add(AllocationForLP, AllocationForCreator)
        local s1 = utils.subtract(currentSupplyResp.Data, preAllocation)
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
        local preAllocation = utils.add(AllocationForLP, AllocationForCreator)
        local s1 = utils.subtract(currentSupplyResp.Data, preAllocation)
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
            TokensSold = tokensToSell,
            Cost = tostring(cost),
            Data = 'Successfully sold ' .. tokensToSell .. ' tokens'
        })
    end
    
    return mod
    
  end
  
  _G.package.loaded["src.handlers.bonding_curve"] = _loaded_mod_src_handlers_bonding_curve()
  
  -- module: "src.utils.validations"
  local function _loaded_mod_src_utils_validations()
    local mod = {}
    
    local regexPatterns = {
        uuid = "^[0-9a-fA-F]%x%x%x%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x$",
        address = "^[a-zA-Z0-9-_]+$",
        email = "^%w+@[%w%.]+%.%w+$",
        url = "^%w+://[%w%.]+%.%w+",
        username = "^[a-zA-Z0-9]+$"
    }
    
    -- Helper function for pattern matching
    local function matches(input, pattern)
        return string.match(input, pattern) ~= nil
    end
    
    local function endsWith(str, ending)
        return ending == "" or str:sub(- #ending) == ending
    end
    
    -- Type checking functions
    function mod.isUuid(input)
        return type(input) == 'string' and matches(input, regexPatterns.uuid)
    end
    
    function mod.isArweaveAddress(input)
        return type(input) == 'string' and #input == 43 and matches(input, regexPatterns.address)
    end
    
    function mod.isObject(input)
        return type(input) == 'table' and not (getmetatable(input) or {}).__isarray
    end
    
    function mod.isArray(input)
        return type(input) == 'table' and (getmetatable(input) or {}).__isarray
    end
    
    function mod.isEmail(input, skipEmptyStringCheck)
        if skipEmptyStringCheck and input == '' then return true end
        return type(input) == 'string' and matches(input, regexPatterns.email)
    end
    
    function mod.isUsername(input)
        return type(input) == 'string' and #input >= 4 and #input <= 39 and not endsWith(input, "-") and
            matches(input, regexPatterns.username)
    end
    
    function mod.isURL(input, skipEmptyStringCheck)
        if skipEmptyStringCheck and input == '' then return true end
        return type(input) == 'string' and matches(input, regexPatterns.url)
    end
    
    -- Main type checking function
    local function isType(input, expectedType, skipEmptyStringCheck)
        if expectedType == 'object' then
            return mod.isObject(input)
        elseif expectedType == 'array' then
            return mod.isArray(input)
        elseif expectedType == 'uuid' then
            return mod.isUuid(input)
        elseif expectedType == 'arweave-address' then
            return mod.isArweaveAddress(input)
        elseif expectedType == 'url' then
            return mod.isURL(input, skipEmptyStringCheck)
        elseif expectedType == 'email' then
            return mod.isEmail(input, skipEmptyStringCheck)
        elseif expectedType == 'username' then
            return mod.isUsername(input)
        else
            return type(input) == expectedType
        end
    end
    
    -- Validation function
    function mod.isInvalidInput(input, expectedTypes, skipEmptyStringCheck)
        skipEmptyStringCheck = skipEmptyStringCheck or false
        if input == nil or (not skipEmptyStringCheck and input == '') then
            return true
        end
    
        if type(expectedTypes) ~= 'table' then expectedTypes = { expectedTypes } end
        for _, expectedType in ipairs(expectedTypes) do
            if isType(input, expectedType, skipEmptyStringCheck) then
                return false
            end
        end
        return true
    end
    
    return mod
    
  end
  
  _G.package.loaded["src.utils.validations"] = _loaded_mod_src_utils_validations()
  
  -- module: "src.handlers.token_manager"
  local function _loaded_mod_src_handlers_token_manager()
    local aolibs         = require "src.libs.aolibs"
    local validations    = require "src.utils.validations"
    local utils          = require "src.utils.mod"
    local bint           = require('.bint')(256)
    local json           = aolibs.json
    local mod            = {}
    
    --- @type RepoToken
    RepoToken            = RepoToken or nil
    --- @type ReserveToken
    ReserveToken         = ReserveToken or nil
    --- @type ReserveBalance
    ReserveBalance       = ReserveBalance or '0'
    --- @type FundingGoal
    FundingGoal          = FundingGoal or '0'
    --- @type AllocationForLP
    AllocationForLP      = AllocationForLP or '0'
    --- @type AllocationForCreator
    AllocationForCreator = AllocationForCreator or '0'
    --- @type SupplyToSell
    SupplyToSell         = SupplyToSell or '0'
    --- @type MaxSupply
    MaxSupply            = MaxSupply or '0'
    --- @type Initialized
    Initialized          = Initialized or false
    --- @type ReachedFundingGoal
    ReachedFundingGoal   = ReachedFundingGoal or false
    
    ---@type HandlerFunction
    function mod.initialize(msg)
        assert(Initialized == false, "TokenManager already initialized")
        assert(msg.Data ~= nil, "Data is required")
    
        --- @type CBTMInitPayload
        local initPayload = json.decode(msg.Data)
    
        if (
                validations.isInvalidInput(initPayload, 'object') or
                validations.isInvalidInput(initPayload.repoToken, 'object') or
                validations.isInvalidInput(initPayload.repoToken.tokenName, 'string') or
                validations.isInvalidInput(initPayload.repoToken.tokenTicker, 'string') or
                validations.isInvalidInput(initPayload.repoToken.denomination, 'string') or
                validations.isInvalidInput(initPayload.repoToken.tokenImage, 'string') or
                validations.isInvalidInput(initPayload.repoToken.processId, 'string') or
                validations.isInvalidInput(initPayload.reserveToken, 'object') or
                validations.isInvalidInput(initPayload.reserveToken.tokenName, 'string') or
                validations.isInvalidInput(initPayload.reserveToken.tokenTicker, 'string') or
                validations.isInvalidInput(initPayload.reserveToken.denomination, 'string') or
                validations.isInvalidInput(initPayload.reserveToken.tokenImage, 'string') or
                validations.isInvalidInput(initPayload.reserveToken.processId, 'string') or
                validations.isInvalidInput(initPayload.fundingGoal, 'string') or
                validations.isInvalidInput(initPayload.allocationForLP, 'string') or
                validations.isInvalidInput(initPayload.allocationForCreator, 'string') or
                validations.isInvalidInput(initPayload.maxSupply, 'string')
            ) then
            if msg.reply then
                msg.reply({
                    Action = 'Initialize-Error',
                    Error = 'Invalid inputs supplied.'
                })
                return
            else
                ao.send({
                    Target = msg.From,
                    Action = 'Initialize-Error',
                    Error = 'Invalid inputs supplied.'
                })
            end
        end
    
        local supplyToSell = utils.subtract(initPayload.maxSupply,
            utils.add(initPayload.allocationForLP, initPayload.allocationForCreator))
    
        if (bint(supplyToSell) <= 0) then
            if msg.reply then
                msg.reply({
                    Action = 'Initialize-Error',
                    Error = 'Pre-Allocations and Dex Allocations exceeds max supply'
                })
                return
            else
                ao.send({
                    Target = msg.From,
                    Action = 'Initialize-Error',
                    Error = 'Pre-Allocations and Dex Allocations exceeds max supply'
                })
                return
            end
        end
    
        RepoToken = initPayload.repoToken
        ReserveToken = initPayload.reserveToken
        FundingGoal = utils.toBalanceValue(utils.toSubUnits(initPayload.fundingGoal, ReserveToken.denomination))
        AllocationForLP = utils.toBalanceValue(utils.toSubUnits(initPayload.allocationForLP, RepoToken.denomination))
        AllocationForCreator = utils.toBalanceValue(utils.toSubUnits(initPayload.allocationForCreator, RepoToken
        .denomination))
        MaxSupply = utils.toBalanceValue(utils.toSubUnits(initPayload.maxSupply, RepoToken.denomination))
        SupplyToSell = utils.toBalanceValue(utils.toSubUnits(supplyToSell, RepoToken.denomination))
    
        Initialized = true
    
        msg.reply({
            Action = 'Initialize-Response',
            Initialized = true,
        })
    end
    
    ---@type HandlerFunction
    function mod.info(msg)
        msg.reply({
            Action = 'Info-Response',
            Data = json.encode({
                reserveBalance = ReserveBalance,
                initialized = Initialized,
                repoToken = RepoToken,
                reserveToken = ReserveToken,
                fundingGoal = FundingGoal,
                allocationForLP = AllocationForLP,
                allocationForCreator = AllocationForCreator,
                maxSupply = MaxSupply,
                supplyToSell = SupplyToSell,
                reachedFundingGoal = ReachedFundingGoal
            })
        })
    end
    
    return mod
    
  end
  
  _G.package.loaded["src.handlers.token_manager"] = _loaded_mod_src_handlers_token_manager()
  
  -- module: "src.utils.patterns"
  local function _loaded_mod_src_utils_patterns()
    local aolibs = require "src.libs.aolibs"    
    local json   = aolibs.json
    
    local mod = {}
    
    function mod.continue(fn)
        return function(msg)
           local patternResult = fn(msg)
           if not patternResult or patternResult == 0 or patternResult == "skip" then
              return 0
           end
           return 1
        end
     end
     
     
     
     
     
     
     function mod.hasMatchingTagOf(name, values)
        return function(msg)
           for _, value in ipairs(values) do
              local patternResult = Handlers.utils.hasMatchingTag(name, value)(msg)
     
     
              if patternResult ~= 0 and patternResult ~= false and patternResult ~= "skip" then
                 return 1
              end
           end
     
           return 0
        end
     end
     
     
     
     
     
     function mod._and(patterns)
        return function(msg)
           for _, pattern in ipairs(patterns) do
              local patternResult = pattern(msg)
     
              if not patternResult or patternResult == 0 or patternResult == "skip" then
                 return 0
              end
           end
     
           return -1
        end
     end
    
     function mod.catchWrapper(handler, handlerName)
    
        local nameString = handlerName and handlerName .. " - " or ""
     
        return function(msg, env)
     
           local status
           local result
     
           status, result = pcall(handler, msg, env)
     
     
           if not status then
              local traceback = debug.traceback()
     
              print("!!! Error: " .. nameString .. json.encode(traceback))
              local err = string.gsub(result, "%[[%w_.\" ]*%]:%d*: ", "")
     
     
     
              RefundError = err
     
              return nil
           end
     
           return result
        end
     end
     
     return mod
  end
  
  _G.package.loaded["src.utils.patterns"] = _loaded_mod_src_utils_patterns()
  
  -- module: "src.utils.helpers"
  local function _loaded_mod_src_utils_helpers()
    local bint = require('.bint')(256)
    local utils = require "src.utils.mod"
    
    local mod = {}
    
    function mod.find(predicate, arr)
        for _, value in ipairs(arr) do
            if predicate(value) then
                return value
            end
        end
        return nil
    end
    
    function mod.filter(predicate, arr)
        local result = {}
        for _, value in ipairs(arr) do
            if predicate(value) then
                table.insert(result, value)
            end
        end
        return result
    end
    
    function mod.reduce(reducer, initialValue, arr)
        local result = initialValue
        for i, value in ipairs(arr) do
            result = reducer(result, value, i, arr)
        end
        return result
    end
    
    
    function mod.map(mapper, arr)
        local result = {}
        for i, value in ipairs(arr) do
            result[i] = mapper(value, i, arr)
        end
        return result
    end
    
    function mod.reverse(arr)
        local result = {}
        for i = #arr, 1, -1 do
            table.insert(result, arr[i])
        end
        return result
    end
    
    function mod.compose(...)
        local funcs = { ... }
        return function(x)
            for i = #funcs, 1, -1 do
                x = funcs[i](x)
            end
            return x
        end
    end
    
    function mod.keys(xs)
        local ks = {}
        for k, _ in pairs(xs) do
            table.insert(ks, k)
        end
        return ks
    end
    
    function mod.values(xs)
        local vs = {}
        for _, v in pairs(xs) do
            table.insert(vs, v)
        end
        return vs
    end
    
    function mod.includes(value, arr)
        for _, v in ipairs(arr) do
            if v == value then
                return true
            end
        end
        return false
    end
    
    function mod.computeTotalSupply()
        local r = mod.reduce(
            function(acc, val) return acc + val end,
            bint.zero(),
            mod.values(Balances))
    
        return r
    end
    
    return mod
    
  end
  
  _G.package.loaded["src.utils.helpers"] = _loaded_mod_src_utils_helpers()
  
  local bondingCurve = require "src.handlers.bonding_curve"
  local tokenManager = require "src.handlers.token_manager"
  local patterns = require "src.utils.patterns"
  local helpers = require "src.utils.helpers"
  
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
  
  Handlers.add(
          "Buy-Tokens",
      { Action = "Credit-Notice", ["X-Action"] = "Buy-Tokens" },
      bondingCurve.buyTokens)