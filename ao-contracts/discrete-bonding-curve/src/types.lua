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
---@field  steps CurveStep[]
---@field  allocationForLP string
---@field  maxSupply string
---@field  initialBuyPrice string
---@field  finalBuyPrice string
---@field  curveType string

---@class CurveStep
---@field  rangeTo string
---@field  price string

---@alias CURVE_PAYLOAD string

---@class CurveDetails
---@field  creator string
---@field  createdAt string
---@field  repoToken TokenDetails
---@field  reserveToken TokenDetails
---@field  steps CurveStep[]
---@field  allocationForLP string
---@field  maxSupply string
---@field  initialBuyPrice string
---@field  finalBuyPrice string
---@field  curveType string
---@field  liquidityPool string | nil
---@field  reserveBalance string