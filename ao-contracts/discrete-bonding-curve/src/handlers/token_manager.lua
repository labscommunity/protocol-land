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
