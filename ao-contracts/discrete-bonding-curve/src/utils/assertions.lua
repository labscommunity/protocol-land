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
