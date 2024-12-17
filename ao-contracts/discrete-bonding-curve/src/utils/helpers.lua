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
