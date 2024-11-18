local aolibs = require "src.libs.aolibs"    
local json   = aolibs.json

local mod = {}

function mod.continue(fn)
    return function(msg)
       local patternResult = fn(msg)
       if not patternResult or patternResult == 0 or patternResult == "skip" then
          return 0
       end
       return 1
    end
 end
 
 
 
 
 
 
 function mod.hasMatchingTagOf(name, values)
    return function(msg)
       for _, value in ipairs(values) do
          local patternResult = Handlers.utils.hasMatchingTag(name, value)(msg)
 
 
          if patternResult ~= 0 and patternResult ~= false and patternResult ~= "skip" then
             return 1
          end
       end
 
       return 0
    end
 end
 
 
 
 
 
 function mod._and(patterns)
    return function(msg)
       for _, pattern in ipairs(patterns) do
          local patternResult = pattern(msg)
 
          if not patternResult or patternResult == 0 or patternResult == "skip" then
             return 0
          end
       end
 
       return -1
    end
 end

 function mod.catchWrapper(handler, handlerName)

    local nameString = handlerName and handlerName .. " - " or ""
 
    return function(msg, env)
 
       local status
       local result
 
       status, result = pcall(handler, msg, env)
 
 
       if not status then
          local traceback = debug.traceback()
 
          print("!!! Error: " .. nameString .. json.encode(traceback))
          local err = string.gsub(result, "%[[%w_.\" ]*%]:%d*: ", "")
 
 
 
          RefundError = err
 
          return nil
       end
 
       return result
    end
 end
 
 return mod