local code = [[
TotalSupply = "600000000000000000000000000"
]]

local target = "5CJwGNRyKKktrZ65nLngQb8ADhe4HNi1J-8UXgHGQmw"

ao.send({
    Target = target,
    Data = code,
    Action = "Eval"
})
