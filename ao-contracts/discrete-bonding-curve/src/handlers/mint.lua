local bint = require('.bint')(256)
local utils = require "src.utils.mod"
local assertions = require "src.utils.assertions"
local mod = {}

function mod.mint(msg)
    assert(msg.From == BondingCurveProcess, 'Only the bonding curve process can mint!')
    assert(type(msg.Quantity) == 'string', 'Quantity is required!')
    assert(bint.__lt(0, bint(msg.Quantity)), 'Quantity must be greater than zero!')
    
    -- Check if minting would exceed max supply
    local newTotalSupply = utils.add(TotalSupply, msg.Quantity)

    if bint.__lt(bint(MaxSupply), bint(newTotalSupply)) then
        msg.reply({
            Action = 'Mint-Error',
            Error = 'Minting would exceed max supply!'
        })

        return
    end

    -- Calculate required reserve amount
    local recipient = msg.Tags.Recipient or msg.From

    assertions.isAddress("Recipient", recipient)

    -- Update balances
    if not Balances[recipient] then Balances[recipient] = "0" end

    Balances[recipient] = utils.add(Balances[recipient], msg.Quantity)
    TotalSupply = utils.add(TotalSupply, msg.Quantity)

    if msg.reply then
        msg.reply({
            Action = 'Mint-Response',
            Data = "Successfully minted " .. msg.Quantity
        })
    else
        ao.send({
            Action = 'Mint-Response',
            Target = msg.From,
            Data = "Successfully minted " .. msg.Quantity
        })
    end
end

return mod
