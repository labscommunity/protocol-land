local json = require('json')
local utils = require('src.utils.mod')
local validations = require('src.utils.validations')
local bint = require('.bint')(256)

local mod = {}

function mod.initializeBondedToken(msg)
    local validAddress = utils.checkValidAddress(msg.From)
    if not validAddress then
        msg.reply({ Action = 'Input-Error', Tags = { Status = 'Error', Message = 'Invalid address' } })
        return
    end


    local decodeCheck, data = utils.decodeMessageData(msg.Data)
    if not decodeCheck or not data then
        msg.reply({ Action = 'Input-Error', Tags = { Status = 'Error', Message = 'Invalid arguments' } })
        return
    end


    if (
            validations.isInvalidInput(data, 'object') or
            validations.isInvalidInput(data.repoToken, 'object') or
            validations.isInvalidInput(data.repoToken.tokenName, 'string') or
            validations.isInvalidInput(data.repoToken.tokenTicker, 'string') or
            validations.isInvalidInput(data.repoToken.denomination, 'string') or
            validations.isInvalidInput(data.repoToken.tokenImage, 'string') or
            validations.isInvalidInput(data.repoToken.processId, 'string') or
            validations.isInvalidInput(data.reserveToken, 'object') or
            validations.isInvalidInput(data.reserveToken.tokenName, 'string') or
            validations.isInvalidInput(data.reserveToken.tokenTicker, 'string') or
            validations.isInvalidInput(data.reserveToken.denomination, 'string') or
            validations.isInvalidInput(data.reserveToken.tokenImage, 'string') or
            validations.isInvalidInput(data.reserveToken.processId, 'string') or
            validations.isInvalidInput(data.initialBuyPrice, 'string') or
            validations.isInvalidInput(data.finalBuyPrice, 'string') or
            validations.isInvalidInput(data.curveType, 'string') or
            validations.isInvalidInput(data.maxSupply, 'string') or
            validations.isInvalidInput(data.allocationForLP, 'string') or
            validations.isInvalidInput(data.steps, 'object')
        ) then
        if msg.reply then
            msg.reply({
                Action = 'Tokenize-Error-Invalid-Inputs',
                Error = 'Invalid inputs supplied.'
            })
            return
        else
            ao.send({
                Target = msg.From,
                Action = 'Tokenize-Error-Invalid-Inputs',
                Error = 'Invalid inputs supplied.'
            })
        end
    end

    assert(#data.steps > 0, "At least one step is required")

    for _, step in ipairs(data.steps) do
        assert(tonumber(step.rangeTo) ~= 0, "rangeTo cannot be 0")
    end

    if (bint.__le(bint(data.maxSupply), bint(0))) then
        msg.reply({
            Action = 'Tokenize-Error-Invalid-Inputs',
            Error = 'Max supply cannot be less than 0'
        })
        return
    end

    local curvePayload = json.encode({
        repoToken = data.repoToken,
        reserveToken = data.reserveToken,
        initialBuyPrice = data.initialBuyPrice,
        finalBuyPrice = data.finalBuyPrice,
        curveType = data.curveType,
        steps = data.steps,
        maxSupply = data.maxSupply,
        allocationForLP = data.allocationForLP,
    })

    local updatedBondingCurveCode = [[
        CURVE_PAYLOAD=]] .. '[[' .. curvePayload .. ']]' .. [[

    ]] .. CURVE_BONDED_TOKEN_MANAGER_SRC

    local curveSpawnSuccessMsg = ao.spawn(ao.env.Module.Id, {
        Tags = {
            Name = data.repoToken.tokenName .. ' Bonding-Curve',
            ['Protocol-Land-Factory'] = ao.id,
            ['Type'] = 'Bonding-Curve',
            ['App'] = 'Protocol-Land',
            ['Authority'] = 'fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY',
            ['CreatedAt'] = tostring(msg.Timestamp),
            Creator = msg.From,
        },
    }).receive()

    local curveProcessId = curveSpawnSuccessMsg.Tags['Process']

    if curveProcessId == nil then
        msg.reply({
            Action = "Tokenize-Error-Failed",
            Data = "Failed to create bonding curve contract."
        })
        return
    end

    ao.send({
        Target = curveProcessId,
        Action = 'Eval',
        Data = updatedBondingCurveCode
    })

    local tokenPayload = json.encode({
        name = data.repoToken.tokenName,
        creator = msg.From,
        ticker = data.repoToken.tokenTicker,
        denomination = data.repoToken.denomination,
        maxSupply = data.maxSupply,
        bondingCurve = curveProcessId,
        logo = data.repoToken.tokenImage,
        allocationForLP = data.allocationForLP
    })

    local updatedAtomicAssetCode = [[
        USER_PAYLOAD=]] .. '[[' .. tokenPayload .. ']]' .. [[
    ]] .. CURVE_BONDED_TOKEN_SRC

    ao.send({
        Target = data.repoToken.processId,
        Action = 'Eval',
        Data = updatedAtomicAssetCode
    })


    msg.reply({
        Action = "Tokenization-Success",
        CurveProcessId = curveProcessId,
        AssetProcessId = data.repoToken.processId,
        Data = json.encode({
            curveProcessId = curveProcessId,
            assetProcessId = data.repoToken.processId,
        })
    })
end

return mod
