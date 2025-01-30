local bint = require('.bint')(256)
local json = require('json')
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
        return tostring(bint(a) / bint(b))
    end,
    udivide = function(a, b)
        return tostring(bint.udiv(bint(a), bint(b)))
    end,
    ceilUdivide = function(a, b)
        local num = bint(a)
        local den = bint(b)
        local quotient = bint.udiv(num, den)
        local remainder = bint.umod(num, den)

        if remainder ~= bint(0) then
            quotient = quotient + bint(1)
        end

        return tostring(quotient)
    end,
    toBalanceValue = function(a)
        return tostring(bint(a))
    end,
    toNumber = function(a)
        return tonumber(a)
    end,
    toSubUnits = function(val, denom)
        return bint(val) * bint.ipow(bint(10), bint(denom))
    end,
    decodeMessageData = function(data)
        local status, decodedData = pcall(json.decode, data)
        if not status or type(decodedData) ~= 'table' then
            return false, nil
        end

        return true, decodedData
    end,
    checkValidAddress = function(address)
        if not address or type(address) ~= "string" then
            return false
        end

        return string.match(address, "^[%w%-_]+$") ~= nil and #address == 43
    end,
    checkValidAmount = function(data)
        return (math.type(tonumber(data)) == "integer" or math.type(tonumber(data)) == "float") and bint(data) > 0
    end
}

return utils
