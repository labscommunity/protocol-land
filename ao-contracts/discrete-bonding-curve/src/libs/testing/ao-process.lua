local ao = require(".ao")

_G.ao = ao

local mod = {}

---Generate a valid Arweave address
---@return string
local function generateAddress()
    local id = ""

    -- possible characters in a valid arweave address
    local chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-"

    while string.len(id) < 43 do
        -- get random char
        local char = math.random(1, string.len(chars))

        -- select and apply char
        id = id .. string.sub(chars, char, char)
    end

    return id
end

function mod.initialize(msg, env)
    -- by requiring '.process' here we are able to reload via .updates
    local process = require ".process"

    ao.init(env)

    -- relocate custom tags to root message
    msg = ao.normalize(msg)

    -- handle process
    pcall(function() return (process.handle(msg, ao)) end)
end

local processId = generateAddress()
local from = generateAddress()
local owner = from

local env = {
    Module = {
        Tags = {
            {
                name = "Memory-Limit",
                value = "1-gb"
            },
            {
                name = "Compute-Limit",
                value = "9000000000000"
            },
            {
                name = "Module-Format",
                value = "wasm64-unknown-emscripten-draft_2024_02_15"
            },
            {
                name = "Data-Protocol",
                value = "ao"
            },
            {
                name = "Type",
                value = "Module"
            },
            {
                name = "Input-Encoding",
                value = "JSON-1"
            },
            {
                name = "Output-Encoding",
                value = "JSON-1"
            },
            {
                name = "Variant",
                value = "ao.TN.1"
            },
            {
                name = "Content-Type",
                value = "application/wasm"
            }
        },
        Owner = "vh-NTHVvlKZqRxc8LyyTNok65yQ55a_PJ1zWLb9G2JI",
        Id = "Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350"
    },
    Process = {
        Tags = {
            ["App-Name"] = "aos",
            ["aos-Version"] = "1.11.3",
            [" Data-Protocol"] = "ao",
            Scheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
            Variant = "ao.TN.1",
            Name = "aos-process",
            Type = "Process",
            SDK = "aoconnect",
            Module = "Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350",
            Authority = "fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY"
        },
        TagArray = {
            {
                name = "App-Name",
                value = "aos"
            },
            {
                name = "Name",
                value = "aos-process"
            },
            {
                name = "Authority",
                value = "fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY"
            },
            {
                name = "aos-Version",
                value = "1.11.3"
            },
            {
                name = "Data-Protocol",
                value = "ao"
            },
            {
                name = "Variant",
                value = "ao.TN.1"
            },
            {
                name = "Type",
                value = "Process"
            },
            {
                name = "Module",
                value = "Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350"
            },
            {
                name = "Scheduler",
                value = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA"
            },
            {
                name = "SDK",
                value = "aoconnect"
            }
        },
        Owner = owner,
        Id = processId
    }
}

mod.initialize(
    {
        Id = generateAddress(),
        Tags = env.Process.Tags,
        From = from,
        Owner = owner,
        Target = processId,
        Data = "",
        ["Block-Height"] = 1469769,
        Module = env.Process.Tags.Module
    },
    env
)

return mod
