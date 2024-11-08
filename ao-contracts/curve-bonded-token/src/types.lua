---@meta _

---@alias Balances table<string, string>
---@alias TotalSupply string
---@alias Name string
---@alias Ticker string
---@alias Denomination number
---@alias Logo string
---@alias MaxSupply string
---@alias BondingCurveProcess string


-- Curve Bonded Token Manager States

---@alias RepoToken TokenDetails
---@alias ReserveToken TokenDetails
---@alias ReserveBalance string
---@alias FundingGoal string
---@alias AllocationForLP string
---@alias AllocationForCreator string
---@alias SupplyToSell string
---@alias Initialized boolean
---@alias ReachedFundingGoal boolean
---@alias LiquidityPool string | nil
---@alias Creator string

---@class TokenDetails
---@field  tokenName string
---@field  tokenTicker string
---@field  denomination number
---@field  tokenImage string
---@field  processId string

---@class CBTMInitPayload
---@field  repoToken TokenDetails
---@field  reserveToken TokenDetails
---@field  fundingGoal string
---@field  allocationForLP string
---@field  allocationForCreator string
---@field  maxSupply string


