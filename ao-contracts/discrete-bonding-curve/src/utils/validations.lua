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
