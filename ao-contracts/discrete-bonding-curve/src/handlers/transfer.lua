local bint = require('.bint')(256)
local utils = require "src.utils.mod"

local mod = {}


function mod.transfer(msg)
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
        if msg.reply then
          msg.reply(debitNotice)
        else
          debitNotice.Target = msg.From
          Send(debitNotice)
        end
        Send(creditNotice)
      end
    else
      if msg.reply then
        msg.reply({
          Action = 'Transfer-Error',
          ['Message-Id'] = msg.Id,
          Error = 'Insufficient Balance!'
        })
      else
        Send({
          Target = msg.From,
          Action = 'Transfer-Error',
          ['Message-Id'] = msg.Id,
          Error = 'Insufficient Balance!'
        })
      end
    end
end

return mod
