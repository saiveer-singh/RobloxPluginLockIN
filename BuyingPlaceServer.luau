-- Buying Place Server Script
-- Handles verification code generation for the coin purchasing game
-- Put this in ServerScriptService

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")

-- Firebase configuration
local DATABASE_URL = "https://tissueai-coins-default-rtdb.firebaseio.com"
local DATABASE_SECRET = "JndkJy6Vg3hMYskq6eUreOM8RquD4jBHJw0mrXAg"
local CODE_LIFETIME = 15 -- seconds

-- Server-side Firebase functions for verification
local function storeVerificationCode(userId, code, displayName)
    warn("=== BUYING PLACE SERVER: ATTEMPTING TO STORE VERIFICATION CODE ===")
    warn("UserId:", userId, "Code:", code, "DisplayName:", displayName)

    local success, result = pcall(function()
        local url = string.format("%s/verification/%s.json?auth=%s", DATABASE_URL, userId, DATABASE_SECRET)
        local currentTick = tick()
        local data = {
            code = code,
            userId = userId,
            displayName = displayName,
            timestamp = currentTick,
            expires = currentTick + CODE_LIFETIME
        }

        warn("=== BUYING PLACE SERVER: STORING VERIFICATION CODE ===")
        warn("URL:", url)
        warn("Data:", HttpService:JSONEncode(data))

        -- Use PUT method to replace data at the specific userId path
        local response = HttpService:RequestAsync({
            Url = url,
            Method = "PUT",
            Headers = {
                ["Content-Type"] = "application/json"
            },
            Body = HttpService:JSONEncode(data)
        })

        warn("Firebase response status:", response.StatusCode)
        warn("Firebase response body:", response.Body)

        if response.StatusCode >= 200 and response.StatusCode < 300 then
            local decoded = HttpService:JSONDecode(response.Body)
            warn("Decoded response:", decoded)
            return decoded
        else
            error("Firebase request failed with status " .. response.StatusCode .. ": " .. response.Body)
        end
    end)

    if not success then
        warn("=== BUYING PLACE SERVER: FAILED TO STORE VERIFICATION CODE ===")
        warn("Error:", tostring(result))
    else
        warn("=== BUYING PLACE SERVER: SUCCESSFULLY STORED VERIFICATION CODE ===")
    end

    return success, result
end

-- Create RemoteEvents folder and handlers
local function setupVerificationRemotes()
    warn("=== BUYING PLACE SERVER: SETTING UP VERIFICATION REMOTES ===")

    local folder = ReplicatedStorage:FindFirstChild("VerificationEvents")
    if not folder then
        folder = Instance.new("Folder")
        folder.Name = "VerificationEvents"
        folder.Parent = ReplicatedStorage
        warn("Created VerificationEvents folder")
    end

    local codeEvent = folder:FindFirstChild("VerificationCode")
    if not codeEvent then
        codeEvent = Instance.new("RemoteEvent")
        codeEvent.Name = "VerificationCode"
        codeEvent.Parent = folder
        warn("Created VerificationCode RemoteEvent")
    end

    local statusEvent = folder:FindFirstChild("VerificationStatus")
    if not statusEvent then
        statusEvent = Instance.new("RemoteEvent")
        statusEvent.Name = "VerificationStatus"
        statusEvent.Parent = folder
        warn("Created VerificationStatus RemoteEvent")
    end

    -- Handle code generation requests from client
    codeEvent.OnServerEvent:Connect(function(player, requestData)
        warn("=== BUYING PLACE SERVER: RECEIVED VERIFICATION REQUEST FROM ===" .. player.Name)
        warn("RequestData:", requestData)

        if requestData and requestData.action == "generateCode" then
            warn("=== BUYING PLACE SERVER: GENERATING CODE ===")

            -- Generate random code
            local chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            local code = ""
            for i = 1, 6 do
                local rand = math.random(1, #chars)
                code = code .. string.sub(chars, rand, rand)
            end

            warn("=== BUYING PLACE SERVER: GENERATED CODE ===" .. code)

            -- Store in Firebase
            local success, firebaseResult = storeVerificationCode(player.UserId, code, player.DisplayName)

            -- Send back to client
            if success then
                warn("=== BUYING PLACE SERVER: SENDING SUCCESS RESPONSE TO CLIENT ===")
                codeEvent:FireClient(player, {
                    success = true,
                    code = code,
                    expires = tick() + CODE_LIFETIME
                })
            else
                warn("=== BUYING PLACE SERVER: SENDING FAILURE RESPONSE TO CLIENT ===")
                codeEvent:FireClient(player, {
                    success = false,
                    error = "Failed to store verification code"
                })
            end
        else
            warn("=== BUYING PLACE SERVER: INVALID REQUEST DATA ===")
        end
    end)

    warn("=== BUYING PLACE SERVER: VERIFICATION REMOTES SETUP COMPLETE ===")
end

-- Initialize
warn("=== BUYING PLACE SERVER: INITIALIZING VERIFICATION SYSTEM ===")
setupVerificationRemotes()
warn("=== BUYING PLACE SERVER: VERIFICATION SYSTEM READY ===")