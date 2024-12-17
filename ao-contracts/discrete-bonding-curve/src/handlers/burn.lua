local bint = require('.bint')(256)
local utils = require "src.utils.mod"
local assertions = require "src.utils.assertions"
local mod = {}

function mod.burn(msg)
    assert(msg.From == BondingCurveProcess, 'Only the bonding curve process can burn!')
    assert(type(msg.Quantity) == 'string', 'Quantity is required!')

    local user = msg.Tags.Recipient
    assertions.isAddress("Recipient", user)

    if bint.__lt(bint(Balances[user]), bint(msg.Quantity)) then
        msg.reply({
            Action = 'Burn-Error',
            Error = 'Quantity must be less than or equal to the current balance'
        })

        return
    end

    -- Update balances
    Balances[user] = utils.subtract(Balances[user], msg.Quantity)
    TotalSupply = utils.subtract(TotalSupply, msg.Quantity)



    if msg.reply then
        msg.reply({
            Action = 'Burn-Response',
            Data = "Successfully burned " .. msg.Quantity
        })
    else
        ao.send({
            Action = 'Burn-Response',

            Target = msg.From,
            Data = "Successfully burned " .. msg.Quantity
        })
    end
end

return mod
