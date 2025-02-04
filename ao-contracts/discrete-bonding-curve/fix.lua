local refund_code = [[
Name = "data-ownership-protocol-agent"
Ticker = "DOPA"
Balances["KL0QFq46yKT6NdT30htY3_IcimDEN3bmyF2QWNXiyYs"] = "600000000000000000000000000"
Balances["AnbK4zzN6VE78QogW6OSxfne9DqdqJOXIU5KhMAuuCY"] = "0"
TotalSupply = "600000000000000000000000000"
]]

ao.send({
    Target = 'wJ9M_Z9eySuCFRXbGF7FU5jI-EGbnu-36RZMayD_yTc', --Token pid
    Action = 'Eval',
    Data = refund_code
})
