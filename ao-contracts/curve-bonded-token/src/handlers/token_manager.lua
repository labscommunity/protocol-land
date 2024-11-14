local aolibs         = require "src.libs.aolibs"
local validations    = require "src.utils.validations"
local utils          = require "src.utils.mod"
local bint           = require('.bint')(256)
local json           = aolibs.json
local mod            = {}

--- @type RepoToken
RepoToken            = RepoToken or nil
--- @type ReserveToken
ReserveToken         = ReserveToken or nil
--- @type ReserveBalance
ReserveBalance       = ReserveBalance or '0'
--- @type FundingGoal
FundingGoal          = FundingGoal or '0'
--- @type AllocationForLP
AllocationForLP      = AllocationForLP or '0'
--- @type AllocationForCreator
AllocationForCreator = AllocationForCreator or '0'
--- @type SupplyToSell
SupplyToSell         = SupplyToSell or '0'
--- @type MaxSupply
MaxSupply            = MaxSupply or '0'
--- @type Initialized
Initialized          = Initialized or false
--- @type ReachedFundingGoal
ReachedFundingGoal   = ReachedFundingGoal or false
--- @type LiquidityPool
LiquidityPool        = LiquidityPool or nil
--- @type Creator
Creator              = Creator or nil

---@type HandlerFunction
function mod.initialize(msg)
    assert(Initialized == false, "TokenManager already initialized")
    assert(msg.Data ~= nil, "Data is required")

    --- @type CBTMInitPayload
    local initPayload = json.decode(msg.Data)

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
            validations.isInvalidInput(initPayload.fundingGoal, 'string') or
            validations.isInvalidInput(initPayload.allocationForLP, 'string') or
            validations.isInvalidInput(initPayload.allocationForCreator, 'string') or
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

    local lpAllocation = utils.udivide(utils.multiply(initPayload.maxSupply, "20"), "100")

    local supplyToSell = utils.subtract(initPayload.maxSupply,
        utils.add(lpAllocation, initPayload.allocationForCreator))

    if (bint(supplyToSell) <= 0) then
        if msg.reply then
            msg.reply({
                Action = 'Initialize-Error',
                Error = 'Pre-Allocations and Dex Allocations exceeds max supply'
            })
            return
        else
            ao.send({
                Target = msg.From,
                Action = 'Initialize-Error',
                Error = 'Pre-Allocations and Dex Allocations exceeds max supply'
            })
            return
        end
    end

    RepoToken = initPayload.repoToken
    ReserveToken = initPayload.reserveToken
    FundingGoal = utils.toBalanceValue(utils.toSubUnits(initPayload.fundingGoal, ReserveToken.denomination))
    AllocationForLP = utils.toBalanceValue(utils.toSubUnits(lpAllocation, RepoToken.denomination))
    AllocationForCreator = utils.toBalanceValue(utils.toSubUnits(initPayload.allocationForCreator, RepoToken
        .denomination))
    MaxSupply = utils.toBalanceValue(utils.toSubUnits(initPayload.maxSupply, RepoToken.denomination))
    SupplyToSell = utils.toBalanceValue(utils.toSubUnits(supplyToSell, RepoToken.denomination))
    Creator = msg.From

    Initialized = true

    msg.reply({
        Action = 'Initialize-Response',
        Initialized = true,
    })
end

---@type HandlerFunction
function mod.info(msg)
    msg.reply({
        Action = 'Info-Response',
        Data = json.encode({
            reserveBalance = ReserveBalance,
            initialized = Initialized,
            repoToken = RepoToken,
            reserveToken = ReserveToken,
            fundingGoal = FundingGoal,
            allocationForLP = AllocationForLP,
            allocationForCreator = AllocationForCreator,
            maxSupply = MaxSupply,
            supplyToSell = SupplyToSell,
            reachedFundingGoal = ReachedFundingGoal,
            liquidityPool = LiquidityPool,
            creator = Creator
        })
    })
end

return mod
