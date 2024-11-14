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
        return tostring(bint(a) / bint(b))
    end,
    udivide = function(a, b)
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
