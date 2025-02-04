local utils = require "src.utils.mod"

local mod = {}

function mod.initToken()
    local decodeCheck, data = utils.decodeMessageData(USER_PAYLOAD)

    if not decodeCheck or not data then
        ao.send({ Action = 'Init-Error', Tags = { Status = 'Error', Message = 'Invalid User Payload' } })
        return
    end

    --- @type Denomination
    Denomination = Denomination or data.denomination
    --- @type Balances
    Balances = Balances or {
        [data.bondingCurve] = utils.toBalanceValue(data.allocationForLP or '0')
    }
    --- @type TotalSupply
    TotalSupply = TotalSupply or utils.toBalanceValue(data.allocationForLP or '0')
    --- @type Name
    Name = Name or data.name
    --- @type Ticker
    Ticker = Ticker or data.ticker
    --- @type Logo
    Logo = Logo or data.logo
    --- @type MaxSupply
    MaxSupply = MaxSupply or data.maxSupply;
    --- @type BondingCurveProcess
    BondingCurveProcess = BondingCurveProcess or data.bondingCurve;
    Creator = Creator or data.creator
end

-- Get token info
---@type HandlerFunction
function mod.info(msg)
    if msg.reply then
        msg.reply({
            Action = 'Info-Response',
            Name = Name,
            Ticker = Ticker,
            Logo = Logo,
            Denomination = tostring(Denomination),
            MaxSupply = MaxSupply,
            TotalSupply = TotalSupply,
            BondingCurveProcess = BondingCurveProcess,
        })
    else
        ao.send({
            Action = 'Info-Response',
            Target = msg.From,
            Name = Name,
            Ticker = Ticker,
            Logo = Logo,
            Denomination = tostring(Denomination)
        })
    end
end

-- Get token total supply
---@type HandlerFunction
function mod.totalSupply(msg)
    assert(msg.From ~= ao.id, 'Cannot call Total-Supply from the same process!')
    if msg.reply then
        msg.reply({
            Action = 'Total-Supply-Response',
            Data = TotalSupply,
            Ticker = Ticker
        })
    else
        Send({
            Target = msg.From,
            Action = 'Total-Supply-Response',
            Data = TotalSupply,
            Ticker = Ticker
        })
    end
end

-- Get token max supply
---@type HandlerFunction
function mod.maxSupply(msg)
    assert(msg.From ~= ao.id, 'Cannot call Max-Supply from the same process!')

    if msg.reply then
        msg.reply({
            Action = 'Max-Supply-Response',
            Data = MaxSupply,
            Ticker = Ticker
        })
    else
        ao.send({
            Target = msg.From,
            Action = 'Max-Supply-Response',
            Data = MaxSupply,
            Ticker = Ticker
        })
    end
end

return mod
