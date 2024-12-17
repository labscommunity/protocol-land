-- module: "src.utils.mod"
local function _loaded_mod_src_utils_mod()
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
      end
  }
  
  return utils
  
end

_G.package.loaded["src.utils.mod"] = _loaded_mod_src_utils_mod()

-- module: "src.libs.aolibs"
local function _loaded_mod_src_libs_aolibs()
  -- These libs should exist in ao
  
  local mod = {}
  
  -- Define json
  
  local cjsonstatus, cjson = pcall(require, "cjson")
  
  if cjsonstatus then
      mod.json = cjson
  else
      local jsonstatus, json = pcall(require, "json")
      if not jsonstatus then
          error("Library 'json' does not exist")
      else
          mod.json = json
      end
  end
  
  return mod
end

_G.package.loaded["src.libs.aolibs"] = _loaded_mod_src_libs_aolibs()

-- module: "arweave.types.type"
local function _loaded_mod_arweave_types_type()
  ---@class Type
  local Type = {
    -- custom name for the defined type
    ---@type string|nil
    name = nil,
    -- list of assertions to perform on any given value
    ---@type { message: string, validate: fun(val: any): boolean }[]
    conditions = nil
  }
  
  -- Execute an assertion for a given value
  ---@param val any Value to assert for
  ---@param message string? Optional message to throw
  ---@param no_error boolean? Optionally disable error throwing (will return boolean)
  function Type:assert(val, message, no_error)
    for _, condition in ipairs(self.conditions) do
      if not condition.validate(val) then
        if no_error then
          return false
        end
        self:error(message or condition.message)
      end
    end
  
    if no_error then
      return true
    end
  end
  
  -- Add a custom condition/assertion to assert for
  ---@param message string Error message for the assertion
  ---@param assertion fun(val: any): boolean Custom assertion function that is asserted with the provided value
  function Type:custom(message, assertion)
    -- condition to add
    local condition = {
      message = message,
      validate = assertion
    }
  
    -- new instance if there are no conditions yet
    if self.conditions == nil then
      local instance = {
        conditions = {}
      }
  
      table.insert(instance.conditions, condition)
      setmetatable(instance, self)
      self.__index = self
  
      return instance
    end
  
    table.insert(self.conditions, condition)
    return self
  end
  
  -- Add an assertion for built in types
  ---@param t "nil"|"number"|"string"|"boolean"|"table"|"function"|"thread"|"userdata" Type to assert for
  ---@param message string? Optional assertion error message
  function Type:type(t, message)
    return self:custom(message or ("Not of type (" .. t .. ")"), function(val)
      return type(val) == t
    end)
  end
  
  -- Type must be userdata
  ---@param message string? Optional assertion error message
  function Type:userdata(message)
    return self:type("userdata", message)
  end
  
  -- Type must be thread
  ---@param message string? Optional assertion error message
  function Type:thread(message)
    return self:type("thread", message)
  end
  
  -- Type must be table
  ---@param message string? Optional assertion error message
  function Type:table(message)
    return self:type("table", message)
  end
  
  -- Table's keys must be of type t
  ---@param t Type Type to assert the keys for
  ---@param message string? Optional assertion error message
  function Type:keys(t, message)
    return self:custom(message or "Invalid table keys", function(val)
      if type(val) ~= "table" then
        return false
      end
  
      for key, _ in pairs(val) do
        -- check if the assertion throws any errors
        local success = pcall(function()
          return t:assert(key)
        end)
  
        if not success then
          return false
        end
      end
  
      return true
    end)
  end
  
  -- Type must be array
  ---@param message string? Optional assertion error message
  function Type:array(message)
    return self:table():keys(Type:number(), message)
  end
  
  -- Table's values must be of type t
  ---@param t Type Type to assert the values for
  ---@param message string? Optional assertion error message
  function Type:values(t, message)
    return self:custom(message or "Invalid table values", function(val)
      if type(val) ~= "table" then
        return false
      end
  
      for _, v in pairs(val) do
        -- check if the assertion throws any errors
        local success = pcall(function()
          return t:assert(v)
        end)
  
        if not success then
          return false
        end
      end
  
      return true
    end)
  end
  
  -- Type must be boolean
  ---@param message string? Optional assertion error message
  function Type:boolean(message)
    return self:type("boolean", message)
  end
  
  -- Type must be function
  ---@param message string? Optional assertion error message
  function Type:_function(message)
    return self:type("function", message)
  end
  
  -- Type must be nil
  ---@param message string? Optional assertion error message
  function Type:_nil(message)
    return self:type("nil", message)
  end
  
  -- Value must be the same
  ---@param val any The value the assertion must be made with
  ---@param message string? Optional assertion error message
  function Type:is(val, message)
    return self:custom(message
                         or "Value did not match expected value (Type:is(expected))",
                       function(v)
      return v == val
    end)
  end
  
  -- Type must be string
  ---@param message string? Optional assertion error message
  function Type:string(message)
    return self:type("string", message)
  end
  
  -- String type must match pattern
  ---@param pattern string Pattern to match
  ---@param message string? Optional assertion error message
  function Type:match(pattern, message)
    return self:custom(message
                         or ("String did not match pattern \"" .. pattern .. "\""),
                       function(val)
      return string.match(val, pattern) ~= nil
    end)
  end
  
  -- String type must be of defined length
  ---@param len number Required length
  ---@param match_type? "less"|"greater" String length should be "less" than or "greater" than the defined length. Leave empty for exact match.
  ---@param message string? Optional assertion error message
  function Type:length(len, match_type, message)
    local match_msgs = {
      less = "String length is not less than " .. len,
      greater = "String length is not greater than " .. len,
      default = "String is not of length " .. len
    }
  
    return self:custom(message or (match_msgs[match_type] or match_msgs.default),
                       function(val)
      local strlen = string.len(val)
  
      -- validate length
      if match_type == "less" then
        return strlen < len
      elseif match_type == "greater" then
        return strlen > len
      end
  
      return strlen == len
    end)
  end
  
  -- Type must be a number
  ---@param message string? Optional assertion error message
  function Type:number(message)
    return self:type("number", message)
  end
  
  -- Number must be an integer (chain after "number()")
  ---@param message string? Optional assertion error message
  function Type:integer(message)
    return self:custom(message or "Number is not an integer", function(val)
      return val % 1 == 0
    end)
  end
  
  -- Number must be even (chain after "number()")
  ---@param message string? Optional assertion error message
  function Type:even(message)
    return self:custom(message or "Number is not even", function(val)
      return val % 2 == 0
    end)
  end
  
  -- Number must be odd (chain after "number()")
  ---@param message string? Optional assertion error message
  function Type:odd(message)
    return self:custom(message or "Number is not odd", function(val)
      return val % 2 == 1
    end)
  end
  
  -- Number must be less than the number "n" (chain after "number()")
  ---@param n number Number to compare with
  ---@param message string? Optional assertion error message
  function Type:less_than(n, message)
    return self:custom(message or ("Number is not less than " .. n), function(val)
      return val < n
    end)
  end
  
  -- Number must be greater than the number "n" (chain after "number()")
  ---@param n number Number to compare with
  ---@param message string? Optional assertion error message
  function Type:greater_than(n, message)
    return self:custom(message or ("Number is not greater than" .. n),
                       function(val)
      return val > n
    end)
  end
  
  -- Make a type optional (allow them to be nil apart from the required type)
  ---@param t Type Type to assert for if the value is not nil
  ---@param message string? Optional assertion error message
  function Type:optional(t, message)
    return self:custom(message or "Optional type did not match", function(val)
      if val == nil then
        return true
      end
  
      t:assert(val)
      return true
    end)
  end
  
  -- Table must be of object
  ---@param obj { [any]: Type }
  ---@param strict? boolean Only allow the defined keys from the object, throw error on other keys (false by default)
  ---@param message string? Optional assertion error message
  function Type:object(obj, strict, message)
    if type(obj) ~= "table" then
      self:error(
        "Invalid object structure provided for object assertion (has to be a table):\n"
          .. tostring(obj))
    end
  
    return self:custom(message
                         or ("Not of defined object (" .. tostring(obj) .. ")"),
                       function(val)
      if type(val) ~= "table" then
        return false
      end
  
      -- for each value, validate
      for key, assertion in pairs(obj) do
        if val[key] == nil then
          return false
        end
  
        -- check if the assertion throws any errors
        local success = pcall(function()
          return assertion:assert(val[key])
        end)
  
        if not success then
          return false
        end
      end
  
      -- in strict mode, we do not allow any other keys
      if strict then
        for key, _ in pairs(val) do
          if obj[key] == nil then
            return false
          end
        end
      end
  
      return true
    end)
  end
  
  -- Type has to be either one of the defined assertions
  ---@param ... Type Type(s) to assert for
  function Type:either(...)
    ---@type Type[]
    local assertions = {
      ...
    }
  
    return self:custom("Neither types matched defined in (Type:either(...))",
                       function(val)
      for _, assertion in ipairs(assertions) do
        if pcall(function()
          return assertion:assert(val)
        end) then
          return true
        end
      end
  
      return false
    end)
  end
  
  -- Type cannot be the defined assertion (tip: for multiple negated assertions, use Type:either(...))
  ---@param t Type Type to NOT assert for
  ---@param message string? Optional assertion error message
  function Type:is_not(t, message)
    return self:custom(message
                         or "Value incorrectly matched with the assertion provided (Type:is_not())",
                       function(val)
      local success = pcall(function()
        return t:assert(val)
      end)
  
      return not success
    end)
  end
  
  -- Set the name of the custom type
  -- This will be used with error logs
  ---@param name string Name of the type definition
  function Type:set_name(name)
    self.name = name
    return self
  end
  
  -- Throw an error
  ---@param message any Message to log
  ---@private
  function Type:error(message)
    error("[Type " .. (self.name or tostring(self.__index)) .. "] "
            .. tostring(message))
  end
  
  return Type
  
end

_G.package.loaded["arweave.types.type"] = _loaded_mod_arweave_types_type()

-- module: "src.utils.assertions"
local function _loaded_mod_src_utils_assertions()
  local Type = require "arweave.types.type"
  
  local mod = {}
  
  ---Assert value is an Arweave address
  ---@param name string
  ---@param value string
  mod.isAddress = function(name, value)
      Type
          :string("Invalid type for `" .. name .. "`. Expected a string for Arweave address.")
          :length(43, nil, "Incorrect length for Arweave address `" .. name .. "`. Must be exactly 43 characters long.")
          :match("[a-zA-Z0-9-_]+",
              "Invalid characters in Arweave address `" ..
              name .. "`. Only alphanumeric characters, dashes, and underscores are allowed.")
          :assert(value)
  end
  
  ---Assert value is an UUID
  ---@param name string
  ---@param value string
  mod.isUuid = function(name, value)
      Type
      :string("Invalid type for `" .. name .. "`. Expected a string for UUID.")
          :match("^[0-9a-fA-F]%x%x%x%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x$",
              "Invalid UUID format for `" .. name .. "`. A valid UUID should follow the 8-4-4-4-12 hexadecimal format.")
          :assert(value)
  end
  
  mod.Array = Type:array("Invalid type (must be array)")
  
  -- string assertion
  mod.String = Type:string("Invalid type (must be a string)")
  
  -- Assert not empty string
  ---@param value any Value to assert for
  ---@param message string? Optional message to throw
  ---@param len number Required length
  ---@param match_type? "less"|"greater" String length should be "less" than or "greater" than the defined length. Leave empty for exact match.
  ---@param len_message string? Optional assertion error message for length
  mod.assertNotEmptyString = function(value, message, len, match_type, len_message)
      Type:string(message):length(len, match_type, len_message):assert(value)
  end
  
  -- number assertion
  mod.Integer = Type:number():integer("Invalid type (must be a integer)")
  -- number assertion
  mod.Number = Type:number("Invalid type (must be a number)")
  
  -- repo name assertion
  mod.RepoName = Type
      :string("Invalid type for Repository name (must be a string)")
      :match("^[a-zA-Z0-9._-]+$",
          "The repository name can only contain ASCII letters, digits, and the characters ., -, and _")
  
  return mod
  
end

_G.package.loaded["src.utils.assertions"] = _loaded_mod_src_utils_assertions()

-- module: "src.handlers.bonding_curve"
local function _loaded_mod_src_handlers_bonding_curve()
  local utils      = require "src.utils.mod"
  local aolibs     = require "src.libs.aolibs"
  local bint       = require('.bint')(256)
  local json       = aolibs.json
  local assertions = require 'src.utils.assertions'
  
  local mod        = {}
  
  --- @type table<string, string>
  RefundsMap       = {}
  
  function RefundHandler(amount, target, pid)
      local refundResp = ao.send({
          Target = pid,
          Action = "Transfer",
          Recipient = target,
          Quantity = tostring(amount),
      }).receive()
  
      if refundResp.Tags['Action'] ~= 'Debit-Notice' then
          RefundsMap[target] = tostring(amount)
          msg.reply({
              Action = 'Refund-Error',
              Error = 'Refund failed'
          })
  
          return false
      end
  
      return true
  end
  
  function LogActivity(action, data, msg)
      ao.send({ Target = ao.id, Action = "Activity-Log", ["User-Action"] = action, Data = data, Message = msg })
  end
  
  local function calculateBuyPrice(tokensToBuy, currentSupply)
      local currentSupplyResp = currentSupply
      local newSupply = utils.add(currentSupplyResp, tokensToBuy)
      local maxSupply = CurveDetails.maxSupply
  
      assert(bint.__le(bint(newSupply), bint(maxSupply)), 'Purchase would exceed maximum supply')
  
      local tokensLeft = tokensToBuy
      local reserveToBond = '0'
      local supplyLeft;
  
      for _, step in ipairs(CurveDetails.steps) do
          if bint.__le(bint(currentSupplyResp), bint(step.rangeTo)) then
              supplyLeft = utils.subtract(step.rangeTo, currentSupplyResp)
  
              if bint.__lt(bint(supplyLeft), bint(tokensLeft)) then
                  if bint.__eq(bint(supplyLeft), bint(0)) then
                      goto continue
                  end
  
                  reserveToBond = utils.add(reserveToBond, utils.multiply(supplyLeft, step.price))
                  currentSupplyResp = utils.add(currentSupplyResp, supplyLeft)
                  tokensLeft = utils.subtract(tokensLeft, supplyLeft)
              else
                  reserveToBond = utils.add(reserveToBond, utils.multiply(tokensLeft, step.price))
                  tokensLeft = '0'
  
                  break;
              end
          end
          ::continue::
      end
  
      assert(bint.__lt(bint(0), bint(reserveToBond)), 'Invalid tokens quantity')
      assert(bint.__eq(bint(tokensLeft), bint(0)), 'Invalid tokens quantity')
  
      return {
          reserveToBond = utils.udivide(reserveToBond, 10 ^ CurveDetails.repoToken.denomination),
      }
  end
  
  local function calculateSellPrice(tokensToSell, currentSupply)
      local currentSupplyResp = currentSupply
  
      local tokensLeft = tokensToSell
      local reserveFromBond = '0'
      local currentStepIdx = 1
  
      for idx, step in ipairs(CurveDetails.steps) do
          if bint.__le(bint(currentSupplyResp), bint(step.rangeTo)) then
              currentStepIdx = idx
              break
          end
      end
  
      while bint.__lt(bint(0), bint(tokensLeft)) do
          local supplyLeft = currentSupplyResp
  
          if currentStepIdx > 1 then
              supplyLeft = utils.subtract(currentSupplyResp, CurveDetails.steps[currentStepIdx - 1].rangeTo)
          end
  
          local tokensToHandle = supplyLeft
          if bint.__lt(bint(tokensLeft), bint(supplyLeft)) then
              tokensToHandle = tokensLeft
          end
  
          reserveFromBond = utils.add(reserveFromBond,
              utils.multiply(tokensToHandle, CurveDetails.steps[currentStepIdx].price))
          tokensLeft = utils.subtract(tokensLeft, tokensToHandle)
          currentSupplyResp = utils.subtract(currentSupplyResp, tokensToHandle)
  
          if currentStepIdx > 1 then
              currentStepIdx = currentStepIdx - 1
          end
      end
  
      assert(bint.__eq(bint(tokensLeft), bint(0)), 'Invalid tokens quantity')
  
      return {
          reserveFromBond = utils.udivide(reserveFromBond, 10 ^ CurveDetails.repoToken.denomination),
      }
  end
  
  ---@type HandlerFunction
  function mod.getLastStep(msg)
      msg.reply({
          Action = 'Get-Last-Step-Response',
          StepIdx = tostring(#CurveDetails.steps),
          Data = json.encode(CurveDetails.steps[#CurveDetails.steps])
      })
  end
  
  ---@type HandlerFunction
  function mod.getCurrentStep(msg)
      local currentSupply = msg.Tags['Current-Supply']
  
      assert(type(currentSupply) == 'string', 'Current supply is required!')
      assert(bint.__lt(0, bint(currentSupply)), 'Current supply must be greater than zero!')
  
  
      for idx, step in ipairs(CurveDetails.steps) do
          if bint.__le(bint(currentSupply), bint(step.rangeTo)) then
              msg.reply({
                  Action = 'Get-Current-Step-Response',
                  StepIdx = tostring(idx),
                  Data = json.encode(step)
              })
  
              return
          end
      end
  
      msg.reply({
          Action = 'Get-Current-Step-Error',
          Error = 'Current supply is invalid'
      })
  end
  
  ---@type HandlerFunction
  function mod.getPriceForNextBuy(msg)
      -- early return issue
      local currentSupplyResp = ao.send({ Target = CurveDetails.repoToken.processId, Action = "Total-Supply" }).receive()
          .Data
      -- local currentSupplyResp = msg.Tags['X-Current-Supply']
      if (currentSupplyResp == nil) then
          msg.reply({
              Action = 'Buy-Tokens-Error',
              Error = 'Failed to get current supply of curve bonded token'
          })
  
          return
      end
  
      currentSupplyResp = tostring(currentSupplyResp)
      local maxSupply = CurveDetails.maxSupply
  
      if bint.__lt(bint(currentSupplyResp), bint(maxSupply)) then
          currentSupplyResp = utils.add(currentSupplyResp, "1")
      end
  
  
      for _, step in ipairs(CurveDetails.steps) do
          if bint.__le(bint(currentSupplyResp), bint(step.rangeTo)) then
              msg.reply({
                  Action = 'Get-Price-For-Next-Buy-Response',
                  Price = tostring(step.price),
                  Data = json.encode(step)
              })
  
              return
          end
      end
  
      msg.reply({
          Action = 'Get-Price-For-Next-Buy-Error',
          Error = 'Current supply is invalid'
      })
  end
  
  ---@type HandlerFunction
  function mod.getBuyPrice(msg)
      local currentSupply = msg.Tags['Current-Supply']
      local tokensToBuy = msg.Tags['Token-Quantity']
  
      assert(type(currentSupply) == 'string', 'Current supply is required!')
      assert(type(tokensToBuy) == 'string', 'Token quantity is required!')
      assert(bint.__lt(0, bint(tokensToBuy)), 'Token quantity must be greater than zero!')
  
      local buyPrice = calculateBuyPrice(tokensToBuy, currentSupply)
  
      msg.reply({
          Action = 'Get-Buy-Price-Response',
          Price = buyPrice.reserveToBond,
          Data = json.encode(buyPrice)
      })
  end
  
  ---@type HandlerFunction
  function mod.buyTokens(msg)
      LogActivity(msg.Tags['X-Action'], json.encode(msg.Tags), "Buy-Tokens Called")
  
      local reservePID = msg.From
      local sender = msg.Tags.Sender
      local quantityReservesSent = msg.Tags.Quantity
      -- token quantity is in balance scaled/sub units
      local tokensToBuy = msg.Tags['X-Token-Quantity']
      -- local slippageTolerance = tonumber(msg.Tags["X-Slippage-Tolerance"]) or 0
  
      assert(type(tokensToBuy) == 'string', 'Token quantity is required!')
      assert(bint.__lt(0, bint(tokensToBuy)), 'Token quantity must be greater than zero!')
  
      if (CurveDetails.repoToken == nil or CurveDetails.repoToken.processId == nil) then
          msg.reply({
              Action = 'Buy-Tokens-Error',
              Error = 'Bonding curve not initialized'
          })
  
          return
      end
  
      -- double call issue
      local currentSupplyResp = ao.send({ Target = CurveDetails.repoToken.processId, Action = "Total-Supply" }).receive()
          .Data
      -- local currentSupplyResp = msg.Tags['X-Current-Supply']
      if (currentSupplyResp == nil) then
          msg.reply({
              Action = 'Buy-Tokens-Error',
              Error = 'Failed to get current supply of curve bonded token'
          })
  
          return
      end
  
      currentSupplyResp = tostring(currentSupplyResp)
  
      local buyPrice = calculateBuyPrice(tokensToBuy, currentSupplyResp)
  
      LogActivity(msg.Tags['X-Action'],
          json.encode({ Cost = buyPrice.reserveToBond, AmountSent = tostring(quantityReservesSent) }),
          "Calculated cost of buying tokens for Reserves sent")
      if bint.__lt(bint(quantityReservesSent), bint(buyPrice.reserveToBond)) then
          LogActivity(msg.Tags['X-Action'],
              json.encode({ Cost = buyPrice.reserveToBond, AmountSent = tostring(quantityReservesSent) }),
              "Insufficient funds sent to buy")
          local refundSuccess = RefundHandler(quantityReservesSent, sender, reservePID)
  
          if not refundSuccess then
              LogActivity(msg.Tags['X-Action'],
                  json.encode({ Cost = buyPrice.reserveToBond, AmountSent = tostring(quantityReservesSent) }),
                  "Refund failed")
              return
          end
  
          ao.send({
              Target = sender,
              Action = "Refund-Notice",
              Quantity = tostring(quantityReservesSent),
          })
  
          msg.reply({
              Cost = buyPrice.reserveToBond,
              AmountSent = tostring(quantityReservesSent),
              Action = 'Buy-Tokens-Error',
              Error = 'Insufficient funds sent to buy'
          })
  
          return
      end
  
      local mintResp = ao.send({ Target = CurveDetails.repoToken.processId, Action = "Mint", Tags = { Quantity = tokensToBuy, Recipient = sender } })
          .receive()
  
      if mintResp.Tags['Action'] ~= 'Mint-Response' then
          LogActivity(msg.Tags['X-Action'],
              json.encode({ Cost = buyPrice.reserveToBond, AmountSent = tostring(quantityReservesSent) }),
              "Failed to mint tokens")
          local refundSuccess = RefundHandler(quantityReservesSent, sender, reservePID)
  
          if not refundSuccess then
              LogActivity(msg.Tags['X-Action'],
                  json.encode({ Cost = buyPrice.reserveToBond, AmountSent = tostring(quantityReservesSent) }),
                  "Refund failed after failed mint")
              return
          end
  
          ao.send({
              Target = sender,
              Action = "Refund-Notice",
              Quantity = tostring(quantityReservesSent),
          })
          msg.reply({
              Action = 'Buy-Tokens-Error',
              Error = 'Failed to mint tokens. Amount will be refunded.'
          })
  
          return
      end
  
      CurveDetails.reserveBalance = utils.add(CurveDetails.reserveBalance, buyPrice.reserveToBond)
  
  
      LogActivity(msg.Tags['X-Action'],
          json.encode({ Cost = buyPrice.reserveToBond, AmountSent = tostring(quantityReservesSent) }),
          "Successfully bought tokens")
  
      msg.reply({
          Action = 'Buy-Tokens-Response',
          TokensBought = utils.toBalanceValue(tokensToBuy),
          Cost = buyPrice.reserveToBond,
          Data = mintResp.Data or ('Successfully bought ' .. tokensToBuy .. ' tokens')
      })
  end
  
  ---@type HandlerFunction
  function mod.getSellPrice(msg)
      local currentSupply = msg.Tags['Current-Supply']
      local tokensToSell = msg.Tags['Token-Quantity']
  
      assert(type(currentSupply) == 'string', 'Current supply is required!')
      assert(type(tokensToSell) == 'string', 'Token quantity is required!')
      assert(bint.__lt(0, bint(tokensToSell)), 'Token quantity must be greater than zero!')
  
      local sellPrice = calculateSellPrice(tokensToSell, currentSupply)
  
      msg.reply({
          Action = 'Get-Sell-Price-Response',
          Price = sellPrice.reserveFromBond,
          Data = json.encode(sellPrice)
      })
  end
  
  ---@type HandlerFunction
  function mod.sellTokens(msg)
      LogActivity(msg.Tags['Action'], json.encode(msg.Tags), "Sell-Tokens Called")
  
      local seller = msg.From
      local tokensToSell = msg.Tags['Token-Quantity'] -- in balance scaled/sub units
  
      assertions.isAddress("From", seller)
      assert(tokensToSell ~= nil, 'Token quantity is required!')
      assert(bint.__lt(0, bint(tokensToSell)), 'Token quantity must be greater than zero!')
  
      if (CurveDetails.repoToken == nil or CurveDetails.repoToken.processId == nil) then
          msg.reply({
              Action = 'Sell-Tokens-Error',
              Error = 'Bonding curve not initialized'
          })
  
          return
      end
  
      -- double call issue
      local currentSupplyResp = ao.send({ Target = CurveDetails.repoToken.processId, Action = "Total-Supply" }).receive()
          .Data
      -- local currentSupplyResp = msg.Tags['X-Current-Supply']
      if (currentSupplyResp == nil) then
          msg.reply({
              Action = 'Sell-Tokens-Error',
              Error = 'Failed to get current supply of curve bonded token'
          })
  
          return
      end
      currentSupplyResp = tostring(currentSupplyResp)
  
      if bint.__lt(bint(currentSupplyResp), bint(tokensToSell)) then
          msg.reply({
              Action = 'Sell-Tokens-Error',
              Error = 'Selling tokens would exceed current supply'
          })
  
          return
      end
  
  
      local sellPrice = calculateSellPrice(tokensToSell, currentSupplyResp)
  
      local burnResp = ao.send({ Target = CurveDetails.repoToken.processId, Action = "Burn", Tags = { Quantity = tokensToSell, Recipient = seller } })
          .receive()
      if burnResp.Tags['Action'] ~= 'Burn-Response' then
          msg.reply({
              Action = 'Sell-Tokens-Error',
              Error = 'Failed to burn tokens.'
          })
  
          return
      end
  
      local transferResp = ao.send({
          Target = CurveDetails.reserveToken.processId,
          Action = "Transfer",
          Recipient = seller,
          Quantity = sellPrice.reserveFromBond
      }).receive()
      if transferResp.Tags['Action'] ~= 'Debit-Notice' then
          msg.reply({
              Action = 'Sell-Tokens-Error',
              Error = 'Failed to transfer reserve tokens after selling repo tokens.'
          })
  
          return
      end
  
      CurveDetails.reserveBalance = utils.subtract(CurveDetails.reserveBalance, sellPrice.reserveFromBond)
  
      msg.reply({
          Action = 'Sell-Tokens-Response',
          TokensSold = utils.toBalanceValue(tokensToSell),
          Cost = sellPrice.reserveFromBond,
          Data = 'Successfully sold ' .. tokensToSell .. ' tokens'
      })
  end
  
  return mod
  
end

_G.package.loaded["src.handlers.bonding_curve"] = _loaded_mod_src_handlers_bonding_curve()

-- module: "src.utils.validations"
local function _loaded_mod_src_utils_validations()
  local mod = {}
  
  local regexPatterns = {
      uuid = "^[0-9a-fA-F]%x%x%x%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x$",
      address = "^[a-zA-Z0-9-_]+$",
      email = "^%w+@[%w%.]+%.%w+$",
      url = "^%w+://[%w%.]+%.%w+",
      username = "^[a-zA-Z0-9]+$"
  }
  
  -- Helper function for pattern matching
  local function matches(input, pattern)
      return string.match(input, pattern) ~= nil
  end
  
  local function endsWith(str, ending)
      return ending == "" or str:sub(- #ending) == ending
  end
  
  -- Type checking functions
  function mod.isUuid(input)
      return type(input) == 'string' and matches(input, regexPatterns.uuid)
  end
  
  function mod.isArweaveAddress(input)
      return type(input) == 'string' and #input == 43 and matches(input, regexPatterns.address)
  end
  
  function mod.isObject(input)
      return type(input) == 'table' and not (getmetatable(input) or {}).__isarray
  end
  
  function mod.isArray(input)
      return type(input) == 'table' and (getmetatable(input) or {}).__isarray
  end
  
  function mod.isEmail(input, skipEmptyStringCheck)
      if skipEmptyStringCheck and input == '' then return true end
      return type(input) == 'string' and matches(input, regexPatterns.email)
  end
  
  function mod.isUsername(input)
      return type(input) == 'string' and #input >= 4 and #input <= 39 and not endsWith(input, "-") and
          matches(input, regexPatterns.username)
  end
  
  function mod.isURL(input, skipEmptyStringCheck)
      if skipEmptyStringCheck and input == '' then return true end
      return type(input) == 'string' and matches(input, regexPatterns.url)
  end
  
  -- Main type checking function
  local function isType(input, expectedType, skipEmptyStringCheck)
      if expectedType == 'object' then
          return mod.isObject(input)
      elseif expectedType == 'array' then
          return mod.isArray(input)
      elseif expectedType == 'uuid' then
          return mod.isUuid(input)
      elseif expectedType == 'arweave-address' then
          return mod.isArweaveAddress(input)
      elseif expectedType == 'url' then
          return mod.isURL(input, skipEmptyStringCheck)
      elseif expectedType == 'email' then
          return mod.isEmail(input, skipEmptyStringCheck)
      elseif expectedType == 'username' then
          return mod.isUsername(input)
      else
          return type(input) == expectedType
      end
  end
  
  -- Validation function
  function mod.isInvalidInput(input, expectedTypes, skipEmptyStringCheck)
      skipEmptyStringCheck = skipEmptyStringCheck or false
      if input == nil or (not skipEmptyStringCheck and input == '') then
          return true
      end
  
      if type(expectedTypes) ~= 'table' then expectedTypes = { expectedTypes } end
      for _, expectedType in ipairs(expectedTypes) do
          if isType(input, expectedType, skipEmptyStringCheck) then
              return false
          end
      end
      return true
  end
  
  return mod
  
end

_G.package.loaded["src.utils.validations"] = _loaded_mod_src_utils_validations()

-- module: "src.handlers.token_manager"
local function _loaded_mod_src_handlers_token_manager()
  local aolibs      = require "src.libs.aolibs"
  local validations = require "src.utils.validations"
  local utils       = require "src.utils.mod"
  local json        = aolibs.json
  local mod         = {}
  
  -- Init state
  function mod.initCurve()
      --- @type CurveDetails
      CurveDetails = CurveDetails or nil
  
      if (CurveDetails == nil) then
          assert(CURVE_PAYLOAD ~= nil, "Curve Payload is required")
          --- @type CBTMInitPayload
          local initPayload = json.decode(CURVE_PAYLOAD)
  
          if (
                  validations.isInvalidInput(initPayload, 'object') or
                  validations.isInvalidInput(initPayload.repoToken, 'object') or
                  validations.isInvalidInput(initPayload.repoToken.tokenName, 'string') or
                  validations.isInvalidInput(initPayload.repoToken.tokenTicker, 'string') or
                  validations.isInvalidInput(initPayload.repoToken.denomination, 'string') or
                  validations.isInvalidInput(initPayload.repoToken.tokenImage, 'string') or
                  validations.isInvalidInput(initPayload.repoToken.processId, 'string') or
                  validations.isInvalidInput(initPayload.reserveToken, 'object') or
                  validations.isInvalidInput(initPayload.reserveToken.tokenName, 'string') or
                  validations.isInvalidInput(initPayload.reserveToken.tokenTicker, 'string') or
                  validations.isInvalidInput(initPayload.reserveToken.denomination, 'string') or
                  validations.isInvalidInput(initPayload.reserveToken.tokenImage, 'string') or
                  validations.isInvalidInput(initPayload.reserveToken.processId, 'string') or
                  validations.isInvalidInput(initPayload.initialBuyPrice, 'string') or
                  validations.isInvalidInput(initPayload.finalBuyPrice, 'string') or
                  validations.isInvalidInput(initPayload.curveType, 'string') or
                  validations.isInvalidInput(initPayload.steps, 'object') or
                  validations.isInvalidInput(initPayload.allocationForLP, 'string') or
                  validations.isInvalidInput(initPayload.maxSupply, 'string')
              ) then
              if msg.reply then
                  msg.reply({
                      Action = 'Initialize-Error',
                      Error = 'Invalid inputs supplied.'
                  })
                  return
              else
                  ao.send({
                      Target = msg.From,
                      Action = 'Initialize-Error',
                      Error = 'Invalid inputs supplied.'
                  })
              end
          end
  
          assert(#initPayload.steps > 0, "At least one step is required")
  
          for _, step in ipairs(initPayload.steps) do
              assert(tonumber(step.rangeTo) ~= 0, "rangeTo cannot be 0")
          end
  
          CurveDetails = {
              creator = ao.env.Process.Tags.Creator,
              repoToken = initPayload.repoToken,
              reserveToken = initPayload.reserveToken,
              steps = initPayload.steps,
              allocationForLP = utils.toBalanceValue(initPayload.allocationForLP),
              maxSupply = utils.toBalanceValue(initPayload.maxSupply),
              initialBuyPrice = initPayload.initialBuyPrice,
              finalBuyPrice = initPayload.finalBuyPrice,
              curveType = initPayload.curveType,
              liquidityPool = nil,
              reserveBalance = "0",
              createdAt = ao.env.Process.Tags.Timestamp
          }
      end
  end
  
  ---@type HandlerFunction
  function mod.info(msg)
      msg.reply({
          Action = 'Info-Response',
          Data = json.encode(CurveDetails)
      })
  end
  
  return mod
  
end

_G.package.loaded["src.handlers.token_manager"] = _loaded_mod_src_handlers_token_manager()

-- module: "src.handlers.liquidity_pool"
local function _loaded_mod_src_handlers_liquidity_pool()
  local utils      = require('src.utils.mod')
  local bint       = require('.bint')(256)
  
  local assertions = require('src.utils.assertions')
  local mod        = {}
  
  function mod.depositToLiquidityPool(msg)
      assert(msg.From == CurveDetails.creator, "Only the creator can make liquidity pool requests")
      assert(CurveDetails.liquidityPool == nil, "Liquidity pool already initialized")
  
      local poolId = msg.Tags['Pool-Id']
      assertions.isAddress('Pool-Id', poolId)
  
      assert(bint.__lt(bint(0), bint(CurveDetails.reserveBalance)), "Insufficient reserve balance to create liquidity pool")
  
      local currentSupplyResp = ao.send({ Target = CurveDetails.repoToken.processId, Action = "Total-Supply" }).receive()
          .Data
  
      if (currentSupplyResp == nil) then
          msg.reply({
              Action = 'Deposit-To-Liquidity-Pool-Error',
              Error = 'Failed to get current supply of curve bonded token'
          })
  
          return
      end
  
      local maxSupply = CurveDetails.maxSupply
  
      if bint.__lt(bint(currentSupplyResp), bint(maxSupply)) then
          msg.reply({
              Action = 'Deposit-To-Liquidity-Pool-Error',
              Error = 'Curve has not reached max supply'
          })
  
          return
      end
  
      local tokenADepositResponse = ao.send({
          Target = CurveDetails.repoToken.processId,
          Action = "Transfer",
          Quantity = CurveDetails.allocationForLP,
          Recipient = poolId,
          ["X-Action"] = "Provide",
          ["X-Slippage-Tolerance"] = "0.5"
      }).receive()
  
      if tokenADepositResponse.Tags['Action'] ~= 'Debit-Notice' then
          msg.reply({
              Action = 'Deposit-To-Liquidity-Pool-Error',
              Error = 'Failed to transfer Repo tokens to LP. try again.'
          })
  
          return
      end
  
      local tokenBDepositResponse = ao.send({
          Target = CurveDetails.reserveToken.processId,
          Action = "Transfer",
          Quantity = CurveDetails.reserveBalance,
          Recipient = poolId,
          ["X-Action"] = "Provide",
          ["X-Slippage-Tolerance"] = "0.5"
      }).receive()
  
      if tokenBDepositResponse.Tags['Action'] ~= 'Debit-Notice' then
          msg.reply({
              Action = 'Deposit-To-Liquidity-Pool-Error',
              Error = 'Failed to transfer Repo tokens to LP. try again.'
          })
  
          return
      end
  
      CurveDetails.liquidityPool = poolId
  
      msg.reply({
          Action = 'Deposit-To-Liquidity-Pool-Response',
          ["Pool-Id"] = poolId,
          ["Status"] = "Success"
      })
  end
  
  return mod
  
end

_G.package.loaded["src.handlers.liquidity_pool"] = _loaded_mod_src_handlers_liquidity_pool()

local bondingCurve = require "src.handlers.bonding_curve"
local tokenManager = require "src.handlers.token_manager"
local liquidityPool = require "src.handlers.liquidity_pool"

tokenManager.initCurve()

Handlers.add('Info', {
        Action = "Info",
    },
    tokenManager.info)

Handlers.add('Get-Last-Step', {
        Action = "Get-Last-Step"
    },
    bondingCurve.getLastStep)

Handlers.add('Get-Current-Step', {
        Action = "Get-Current-Step"
    },
    bondingCurve.getCurrentStep)

Handlers.add('Get-Price-For-Next-Buy', {
        Action = "Get-Price-For-Next-Buy"
    },
    bondingCurve.getPriceForNextBuy)

Handlers.add('Deposit-To-Liquidity-Pool', {
        Action = "Deposit-To-Liquidity-Pool"
    },
    liquidityPool.depositToLiquidityPool)

Handlers.add('Get-Buy-Price', {
        Action = "Get-Buy-Price"
    },
    bondingCurve.getBuyPrice)

Handlers.add('Get-Sell-Price', {
        Action = "Get-Sell-Price"
    },
    bondingCurve.getSellPrice)

Handlers.add(
    "Buy-Tokens",
    { Action = "Credit-Notice", ["X-Action"] = "Buy-Tokens" },
    bondingCurve.buyTokens)

Handlers.add('Sell-Tokens', {
        Action = "Sell-Tokens"
    },
    bondingCurve.sellTokens)