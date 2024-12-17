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