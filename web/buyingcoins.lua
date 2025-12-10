--[[
	Roblox Developer Product Purchase Script for Coins
	
	This script handles purchasing coins via Developer Products.
	When a player buys a developer product, it grants them coins
	and syncs the balance to Firebase.
]]

local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")

-- Configuration
local FIREBASE_URL = "https://tissueai-coins-default-rtdb.firebaseio.com"
-- IMPORTANT: use a database secret or custom auth token so Firebase accepts the request
-- Generate one in Firebase console (Project Settings -> Service Accounts -> Database secrets)
local FIREBASE_AUTH = "JndkJy6Vg3hMYskq6eUreOM8RquD4jBHJw0mrXAg"
local WEB_API_URL = "https://your-website-url.com" -- Replace with your actual website URL

-- Developer Product IDs and their coin values
local COIN_PRODUCTS = {
	-- Replace these IDs with your actual Developer Product IDs
	[3443806454] = 100,  -- 100 Coins
	[3443806564] = 500,  -- 500 Coins
	[3443806706] = 1000, -- 1000 Coins
	[3474705330] = 2500, -- 2500 Coins
	[123456793] = 10000 -- 10000 Coins
}

-- Local cache of coin balances
local coinBalances = {}

-- Small helper to hit Firebase with proper auth and error logging
local function requestFirebase(method, path, body)
	local url = string.format("%s/%s.json?auth=%s", FIREBASE_URL, path, FIREBASE_AUTH)
	local requestBody = body and HttpService:JSONEncode(body) or nil

	print("=== FIREBASE REQUEST ===")
	print("Method:", method)
	print("URL:", url)
	print("Body:", requestBody or "nil")

	local success, response = pcall(function()
		return HttpService:RequestAsync({
			Url = url,
			Method = method,
			Headers = {
				["Content-Type"] = "application/json"
			},
			Body = requestBody,
		})
	end)

	if not success then
		warn("=== FIREBASE ERROR ===")
		warn("HTTP request to Firebase failed:", response)
		warn("Make sure HTTP requests are enabled in Game Settings!")
		warn("Make sure Firebase auth token is valid!")
		return nil
	end

	print("=== FIREBASE RESPONSE ===")
	print("Status Code:", response.StatusCode)
	print("Success:", response.Success)
	print("Response Body:", response.Body)

	if not response.Success then
		warn("=== FIREBASE REQUEST FAILED ===")
		warn(string.format("Firebase %s %s failed (%s): %s", method, path, response.StatusCode, response.Body))
		if response.StatusCode == 401 then
			warn("ERROR: Invalid Firebase auth token!")
		elseif response.StatusCode == 404 then
			warn("ERROR: Firebase database URL not found!")
		elseif response.StatusCode >= 500 then
			warn("ERROR: Firebase server error!")
		end
		return nil
	end

	print("=== FIREBASE REQUEST SUCCESS ===")
	return response.Body
end

-- Initialize player's coin balance from Firebase
local function initializePlayer(player)
	local userId = tostring(player.UserId) -- Use actual Roblox user ID
	
	-- Try to fetch from Firebase
	local result = requestFirebase("GET", "users/" .. userId)

	if result then
		local data = HttpService:JSONDecode(result)
		if data and data.coins then
			coinBalances[userId] = data.coins
		else
			-- Initialize new user
			coinBalances[userId] = 0
			syncCoinsToFirebase(userId, 0)
		end
	else
		-- Default to 0 if fetch fails
		coinBalances[userId] = 0
		warn("Failed to fetch coins for user " .. userId .. " (check HTTP requests are enabled and auth token is valid)")
	end
end

-- Sync coin balance to Firebase
function syncCoinsToFirebase(userId, coins)
	local data = {
		userId = userId,
		coins = coins,
		lastUpdated = os.time() * 1000 -- Convert to milliseconds
	}

	local result = requestFirebase("PATCH", "users/" .. userId, data)

	if not result then
		warn("Failed to sync coins to Firebase for user", userId)
	end
end

-- Get player's current coin balance
local function getCoins(player)
	local userId = tostring(player.UserId)
	return coinBalances[userId] or 0
end

-- Add coins to player's balance
local function addCoins(player, amount)
	local userId = tostring(player.UserId) -- Use actual Roblox user ID
	local currentCoins = getCoins(player)
	local newBalance = currentCoins + amount

	coinBalances[userId] = newBalance

	-- Sync to Firebase
	syncCoinsToFirebase(userId, newBalance)

	return newBalance
end

-- Process developer product receipt
local function processReceipt(receiptInfo)
	local player = Players:GetPlayerByUserId(receiptInfo.PlayerId)
	
	if not player then
		-- Player left, grant later
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	
	local productId = receiptInfo.ProductId
	local coinAmount = COIN_PRODUCTS[productId]
	
	if not coinAmount then
		warn("Unknown product ID:", productId)
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	
	-- Add coins to player
	local newBalance = addCoins(player, coinAmount)
	
	-- Notify player
	print(string.format("Player %s purchased %d coins. New balance: %d", 
		player.Name, coinAmount, newBalance))
	
	-- You can also fire a RemoteEvent here to update the UI
	-- game.ReplicatedStorage.CoinsPurchased:FireClient(player, coinAmount, newBalance)
	
	return Enum.ProductPurchaseDecision.PurchaseGranted
end

-- Set up the receipt callback
MarketplaceService.ProcessReceipt = processReceipt

-- Initialize players when they join
Players.PlayerAdded:Connect(function(player)
	initializePlayer(player)
end)

-- Clean up when player leaves
Players.PlayerRemoving:Connect(function(player)
	local userId = tostring(player.UserId) -- Use actual Roblox user ID
	coinBalances[userId] = nil
end)

-- Initialize existing players
for _, player in ipairs(Players:GetPlayers()) do
	task.spawn(initializePlayer, player)
end

-- Optional: Function to prompt a purchase (call from another script)
function promptCoinPurchase(player, productId)
	if not COIN_PRODUCTS[productId] then
		warn("Invalid product ID:", productId)
		return
	end
	
	MarketplaceService:PromptProductPurchase(player, productId)
end

-- Optional: Function to get coin balance (for UI)
function getPlayerCoins(player)
	return getCoins(player)
end

print("Coin purchase system initialized!")
