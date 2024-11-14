import { RepoToken } from '@/types/repository'

export function createTokenLua(token: RepoToken): string {
  let luaCode = `
local bint = require('.bint')(256)
local json = require('json')

utils = {
    add = function(a, b)
      return tostring(bint(a) + bint(b))
    end,
    subtract = function(a, b)
      return tostring(bint(a) - bint(b))
    end,
    toBalanceValue = function(a)
      return tostring(bint(a))
    end,
    toNumber = function(a)
      return bint.tonumber(a)
    end
}

Denomination = Denomination or ${+token.denomination}

Balances = Balances or {
    `
  token.allocations.forEach((allocation) => {
    const balance = (+token.totalSupply * +allocation.percentage) / 100
    luaCode += `
    ['${allocation.address}'] = utils.toBalanceValue("${balance * 10 ** +token.denomination}"),
    `
  })
  const allocatedSupply = token.allocations.reduce(
    (sum, allocation) => sum + (+token.totalSupply * +allocation.percentage) / 100,
    0
  )
  const remainingBalance = +token.totalSupply - allocatedSupply

  if (remainingBalance > 0) {
    luaCode += `
    [ao.id] = utils.toBalanceValue("${remainingBalance * 10 ** +token.denomination}")
    `
  }
  luaCode += `
  }
`

  luaCode += `
Name = Name or '${token.tokenName}'

Ticker = Ticker or '${token.tokenTicker}'

TotalSupply = TotalSupply or utils.toBalanceValue("${+token.totalSupply * 10 ** +token.denomination}")

Logo = Logo or '${token.tokenImage}'
`

  luaCode += `
  --[[
    Info
  ]]
--
Handlers.add('info', Handlers.utils.hasMatchingTag('Action', 'Info'), function(msg)
 ao.send({
   Target = msg.From,
   Name = Name,
   Ticker = Ticker,
   Logo = Logo,
   Denomination = tostring(Denomination)
 })
end)

--[[
    Balance
  ]]
--
Handlers.add('balance', Handlers.utils.hasMatchingTag('Action', 'Balance'), function(msg)
 local bal = '0'

 -- If not Recipient is provided, then return the Senders balance
 if (msg.Tags.Recipient) then
   if (Balances[msg.Tags.Recipient]) then
     bal = Balances[msg.Tags.Recipient]
   end
 elseif msg.Tags.Target and Balances[msg.Tags.Target] then
   bal = Balances[msg.Tags.Target]
 elseif Balances[msg.From] then
   bal = Balances[msg.From]
 end

 ao.send({
   Target = msg.From,
   Balance = bal,
   Ticker = Ticker,
   Account = msg.Tags.Recipient or msg.From,
   Data = bal
 })
end)


--[[
    Balances
  ]]
--
Handlers.add('balances', Handlers.utils.hasMatchingTag('Action', 'Balances'),
 function(msg) ao.send({ Target = msg.From, Data = json.encode(Balances) }) end)

 --[[
    Transfer
  ]]
--
Handlers.add('transfer', Handlers.utils.hasMatchingTag('Action', 'Transfer'), function(msg)
 assert(type(msg.Recipient) == 'string', 'Recipient is required!')
 assert(type(msg.Quantity) == 'string', 'Quantity is required!')
 assert(bint.__lt(0, bint(msg.Quantity)), 'Quantity must be greater than 0')

 if not Balances[msg.From] then Balances[msg.From] = "0" end
 if not Balances[msg.Recipient] then Balances[msg.Recipient] = "0" end

 if bint(msg.Quantity) <= bint(Balances[msg.From]) then
   Balances[msg.From] = utils.subtract(Balances[msg.From], msg.Quantity)
   Balances[msg.Recipient] = utils.add(Balances[msg.Recipient], msg.Quantity)

   --[[
        Only send the notifications to the Sender and Recipient
        if the Cast tag is not set on the Transfer message
      ]]
   --
   if not msg.Cast then
     -- Debit-Notice message template, that is sent to the Sender of the transfer
     local debitNotice = {
       Target = msg.From,
       Action = 'Debit-Notice',
       Recipient = msg.Recipient,
       Quantity = msg.Quantity,
       Data = Colors.gray ..
           "You transferred " ..
           Colors.blue .. msg.Quantity .. Colors.gray .. " to " .. Colors.green .. msg.Recipient .. Colors.reset
     }
     -- Credit-Notice message template, that is sent to the Recipient of the transfer
     local creditNotice = {
       Target = msg.Recipient,
       Action = 'Credit-Notice',
       Sender = msg.From,
       Quantity = msg.Quantity,
       Data = Colors.gray ..
           "You received " ..
           Colors.blue .. msg.Quantity .. Colors.gray .. " from " .. Colors.green .. msg.From .. Colors.reset
     }

     -- Add forwarded tags to the credit and debit notice messages
     for tagName, tagValue in pairs(msg) do
       -- Tags beginning with "X-" are forwarded
       if string.sub(tagName, 1, 2) == "X-" then
         debitNotice[tagName] = tagValue
         creditNotice[tagName] = tagValue
       end
     end

     -- Send Debit-Notice and Credit-Notice
     ao.send(debitNotice)
     ao.send(creditNotice)
   end
 else
   ao.send({
     Target = msg.From,
     Action = 'Transfer-Error',
     ['Message-Id'] = msg.Id,
     Error = 'Insufficient Balance!'
   })
 end
end)

--[[
    Total Supply
  ]]
--
Handlers.add('totalSupply', Handlers.utils.hasMatchingTag('Action', 'Total-Supply'), function(msg)
 assert(msg.From ~= ao.id, 'Cannot call Total-Supply from the same process!')

 ao.send({
   Target = msg.From,
   Action = 'Total-Supply',
   Data = TotalSupply,
   Ticker = Ticker
 })
end)

--[[
Burn
]] --
Handlers.add('burn', Handlers.utils.hasMatchingTag('Action', 'Burn'), function(msg)
 assert(type(msg.Quantity) == 'string', 'Quantity is required!')
 assert(bint(msg.Quantity) <= bint(Balances[msg.From]), 'Quantity must be less than or equal to the current balance!')

 Balances[msg.From] = utils.subtract(Balances[msg.From], msg.Quantity)
 TotalSupply = utils.subtract(TotalSupply, msg.Quantity)

 ao.send({
   Target = msg.From,
   Data = Colors.gray .. "Successfully burned " .. Colors.blue .. msg.Quantity .. Colors.reset
 })
end)
`

  return luaCode
}
