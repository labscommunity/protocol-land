import { RepoToken } from '@/types/repository'

export function createCurveBondedTokenLua(token: RepoToken, bondingCurveId: string): string {
  let luaCode = `
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
  
end

_G.package.loaded["src.utils.mod"] = _loaded_mod_src_utils_mod()

-- module: "src.handlers.token"
local function _loaded_mod_src_handlers_token()
  local utils = require "src.utils.mod"
  
  local mod = {}
  
  --- @type Denomination
  Denomination = Denomination or ${+token.denomination}
  --- @type Balances
  Balances = Balances or { [ao.id] = utils.toBalanceValue(0) }
  --- @type TotalSupply
  TotalSupply = TotalSupply or utils.toBalanceValue(0)
  --- @type Name
  Name = Name or '${token.tokenName}'
  --- @type Ticker
  Ticker = Ticker or '${token.tokenTicker}'
  --- @type Logo
  Logo = Logo or '${token.tokenImage}'
  --- @type MaxSupply
  MaxSupply = MaxSupply or '${+token.totalSupply * 10 ** +token.denomination}' ;
  --- @type BondingCurveProcess
  BondingCurveProcess = BondingCurveProcess or '${bondingCurveId}';
  
  -- Get token info
  ---@type HandlerFunction
  function mod.info(msg)
      if msg.reply then
          msg.reply({
              Action = 'Info-Response',
              Name = Name,
              Ticker = Ticker,
              Logo = Logo,
              Denomination = tostring(Denomination),
              MaxSupply = MaxSupply,
              TotalSupply = TotalSupply,
              BondingCurveProcess = BondingCurveProcess,
          })
      else
          ao.send({
              Action = 'Info-Response',
              Target = msg.From,
              Name = Name,
              Ticker = Ticker,
              Logo = Logo,
              Denomination = tostring(Denomination)
          })
      end
  end
  
  -- Get token total supply
  ---@type HandlerFunction
  function mod.totalSupply(msg)
      assert(msg.From ~= ao.id, 'Cannot call Total-Supply from the same process!')
      if msg.reply then
          msg.reply({
              Action = 'Total-Supply-Response',
              Data = TotalSupply,
              Ticker = Ticker
          })
      else
          Send({
              Target = msg.From,
              Action = 'Total-Supply-Response',
              Data = TotalSupply,
              Ticker = Ticker
          })
      end
  end
  
  -- Get token max supply
  ---@type HandlerFunction
  function mod.maxSupply(msg)
      assert(msg.From ~= ao.id, 'Cannot call Max-Supply from the same process!')
  
      if msg.reply then
          msg.reply({
              Action = 'Max-Supply-Response',
              Data = MaxSupply,
              Ticker = Ticker
          })
      else
          ao.send({
              Target = msg.From,
              Action = 'Max-Supply-Response',
              Data = MaxSupply,
              Ticker = Ticker
          })
      end
  end
  
  return mod
  
end

_G.package.loaded["src.handlers.token"] = _loaded_mod_src_handlers_token()

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

-- module: "src.handlers.balance"
local function _loaded_mod_src_handlers_balance()
  local aolibs = require "src.libs.aolibs"    
  local json   = aolibs.json
  
  local mod    = {}
  
  -- Get target balance
  ---@type HandlerFunction
  function mod.balance(msg)
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
      if msg.reply then
          msg.reply({
              Action = 'Balance-Response',
              Balance = bal,
              Ticker = Ticker,
              Account = msg.Tags.Recipient or msg.From,
              Data = bal
          })
      else
          ao.send({
              Action = 'Balance-Response',
              Target = msg.From,
              Balance = bal,
              Ticker = Ticker,
              Account = msg.Tags.Recipient or msg.From,
              Data = bal
          })
      end
  end
  
  -- Get balances
  ---@type HandlerFunction
  function mod.balances(msg)
      if msg.reply then
          msg.reply({ Data = json.encode(Balances) })
      else
          ao.send({ Target = msg.From, Data = json.encode(Balances) })
      end
  end
  
  return mod
  
end

_G.package.loaded["src.handlers.balance"] = _loaded_mod_src_handlers_balance()

-- module: "src.handlers.transfer"
local function _loaded_mod_src_handlers_transfer()
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
  
end

_G.package.loaded["src.handlers.transfer"] = _loaded_mod_src_handlers_transfer()

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
                         or ("String did not match pattern"),
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
        "Invalid object structure provided for object assertion (has to be a table):"
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
          `
          luaCode += ':string("Invalid type for `" .. name .. "`. Expected a string for Arweave address.")\n'
          luaCode += ':length(43, nil, "Incorrect length for Arweave address `" .. name .. "`. Must be exactly 43 characters long.")\n'
      luaCode += ':match("[a-zA-Z0-9-_]+",\n'
      luaCode +='"Invalid characters in Arweave address `" ..\n'
             luaCode +='name .. "`. Only alphanumeric characters, dashes, and underscores are allowed.")\n'
             luaCode +=':assert(value)\n'
  luaCode += `end
  
  ---Assert value is an UUID
  ---@param name string
  ---@param value string
  mod.isUuid = function(name, value)
      Type
      `
      luaCode += ':string("Invalid type for `" .. name .. "`. Expected a string for UUID.")'
      luaCode += ':match("^[0-9a-fA-F]%x%x%x%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x$",'
      luaCode += '    "Invalid UUID format for `" ..'
             luaCode +='    name .. "`. A valid UUID should follow the 8-4-4-4-12 hexadecimal format.")'
             luaCode +='    :assert(value)'
  luaCode += `end
  
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

-- module: "src.handlers.mint"
local function _loaded_mod_src_handlers_mint()
  local bint = require('.bint')(256)
  local utils = require "src.utils.mod"
  local assertions = require "src.utils.assertions"
  local mod = {}
  
  function mod.mint(msg)
      assert(msg.From == BondingCurveProcess, 'Only the bonding curve process can mint!')
      assert(type(msg.Quantity) == 'string', 'Quantity is required!')
      assert(bint.__lt(0, msg.Quantity), 'Quantity must be greater than zero!')
      
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
  
end

_G.package.loaded["src.handlers.mint"] = _loaded_mod_src_handlers_mint()

-- module: "src.handlers.burn"
local function _loaded_mod_src_handlers_burn()
  local bint = require('.bint')(256)
  local utils = require "src.utils.mod"
  local assertions = require "src.utils.assertions"
  local mod = {}
  
  function mod.burn(msg)
      assert(msg.From == BondingCurveProcess, 'Only the bonding curve process can burn!')
      assert(type(msg.Quantity) == 'string', 'Quantity is required!')
  
      local user = msg.Tags.Recipient
      assertions.isAddress("Recipient", user)
  
      if bint.__le(bint(Balances[user]), bint(msg.Quantity)) then
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
  
end

_G.package.loaded["src.handlers.burn"] = _loaded_mod_src_handlers_burn()

local token = require "src.handlers.token"
local balance = require "src.handlers.balance"
local transfer = require "src.handlers.transfer"
local mint = require "src.handlers.mint"
local burn = require "src.handlers.burn"

-- Info
Handlers.add('Info', Handlers.utils.hasMatchingTag('Action', 'Info'), token.info)

-- Total Supply
Handlers.add('Total-Supply', Handlers.utils.hasMatchingTag('Action', "Total-Supply"), token.totalSupply)

-- Max Supply
Handlers.add('Max-Supply', Handlers.utils.hasMatchingTag('Action', "Max-Supply"), token.maxSupply)

-- Balance
Handlers.add('Balance', Handlers.utils.hasMatchingTag('Action', 'Balance'), balance.balance)

-- Balances
Handlers.add('Balances', Handlers.utils.hasMatchingTag('Action', 'Balances'), balance.balances)

-- Transfer
Handlers.add('Transfer', Handlers.utils.hasMatchingTag('Action', 'Transfer'), transfer.transfer)

-- Mint
Handlers.add('Mint', Handlers.utils.hasMatchingTag('Action', 'Mint'), mint.mint)

-- Burn
Handlers.add('Burn', Handlers.utils.hasMatchingTag('Action', 'Burn'), burn.burn)
`

  return luaCode
}
