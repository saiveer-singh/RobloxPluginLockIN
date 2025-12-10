-- VerificationHandler.luau
-- Secure verification system for Roblox plugin authentication
-- Generates unique codes every 15 seconds and verifies via Firebase

local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Firebase configuration
local DATABASE_URL = "https://tissueai-coins-default-rtdb.firebaseio.com"
local DATABASE_SECRET = "JndkJy6Vg3hMYskq6eUreOM8RquD4jBHJw0mrXAg"

-- VerificationHandler module
local VerificationHandler = {}

-- Private variables
local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local currentCode = ""
local isVerified = false
local verificationStartTime = tick()
local lastCodeGeneration = 0
local CODE_LIFETIME = 15 -- seconds

-- RemoteEvents for communication
local remoteEvents = {}
local remoteEventCreated = false

-- GUI variables
local verificationGui = nil
local codeLabel = nil
local countdownLabel = nil

-- Generate a random 6-character alphanumeric code
local function generateRandomCode()
    local chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    local code = ""
    for i = 1, 6 do
        local rand = math.random(1, #chars)
        code = code .. string.sub(chars, rand, rand)
    end
    return code
end

-- Create the verification GUI at the top of screen
local function createVerificationGui()
    if verificationGui then return verificationGui end
    
    -- Create main GUI
    verificationGui = Instance.new("ScreenGui")
    verificationGui.Name = "VerificationHandlerGui"
    verificationGui.ResetOnSpawn = false
    verificationGui.Enabled = true
    verificationGui.Parent = playerGui
    
    -- Create background frame
    local bgFrame = Instance.new("Frame")
    bgFrame.Size = UDim2.new(0.3, 0, 0.08, 0)
    bgFrame.Position = UDim2.new(0.35, 0, 0.02, 0) -- Top center
    bgFrame.BackgroundColor3 = Color3.fromRGB(20, 20, 30)
    bgFrame.BackgroundTransparency = 0.1
    bgFrame.BorderSizePixel = 0
    
    -- Add rounded corners
    local uiCorner = Instance.new("UICorner")
    uiCorner.CornerRadius = UDim.new(0, 8)
    uiCorner.Parent = bgFrame
    
    -- Add stroke
    local uiStroke = Instance.new("UIStroke")
    uiStroke.Color = Color3.fromRGB(100, 100, 200)
    uiStroke.Thickness = 2
    uiStroke.Parent = bgFrame
    
    bgFrame.Parent = verificationGui
    
    -- Title label
    local titleLabel = Instance.new("TextLabel")
    titleLabel.Size = UDim2.new(1, 0, 0.4, 0)
    titleLabel.Position = UDim2.new(0, 0, 0, 0)
    titleLabel.BackgroundTransparency = 1
    titleLabel.Text = "🔐 VERIFICATION REQUIRED"
    titleLabel.TextColor3 = Color3.fromRGB(0, 200, 255)
    titleLabel.TextSize = 14
    titleLabel.Font = Enum.Font.SourceSansBold
    titleLabel.Parent = bgFrame
    
    -- Code display label
    codeLabel = Instance.new("TextLabel")
    codeLabel.Size = UDim2.new(1, 0, 0.3, 0)
    codeLabel.Position = UDim2.new(0, 0, 0.35, 0)
    codeLabel.BackgroundTransparency = 1
    codeLabel.Text = "Generating code..."
    codeLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
    codeLabel.TextSize = 18
    codeLabel.Font = Enum.Font.SourceSansBold
    codeLabel.Parent = bgFrame
    
    -- Countdown label
    countdownLabel = Instance.new("TextLabel")
    countdownLabel.Size = UDim2.new(1, 0, 0.25, 0)
    countdownLabel.Position = UDim2.new(0, 0, 0.7, 0)
    countdownLabel.BackgroundTransparency = 1
    countdownLabel.Text = "Expires in: 15s"
    countdownLabel.TextColor3 = Color3.fromRGB(255, 255, 100)
    countdownLabel.TextSize = 12
    countdownLabel.Font = Enum.Font.SourceSans
    countdownLabel.Parent = bgFrame
    
    return verificationGui
end

-- Update GUI with current code and countdown
local function updateGui(code, timeLeft)
    if not verificationGui then return end
    
    if code then
        codeLabel.Text = "Code: " .. string.upper(code)
        codeLabel.TextColor3 = Color3.fromRGB(0, 255, 100)
    end
    
    local floorTime = math.floor(timeLeft)
    countdownLabel.Text = "Expires in: " .. floorTime .. "s"
    
    -- Color coding based on remaining time
    if floorTime <= 5 then
        countdownLabel.TextColor3 = Color3.fromRGB(255, 50, 50)
    elseif floorTime <= 10 then
        countdownLabel.TextColor3 = Color3.fromRGB(255, 150, 50)
    else
        countdownLabel.TextColor3 = Color3.fromRGB(255, 255, 100)
    end
end

-- Hide verification GUI
local function hideVerificationGui()
    if verificationGui then
        verificationGui.Enabled = false
        -- Don't destroy completely, in case we need to show it again
    end
end

-- Create RemoteEvents if they don't exist
local function ensureRemoteEvents()
    if remoteEventCreated then return end
    
    local folder = ReplicatedStorage:FindFirstChild("VerificationEvents")
    if not folder then
        folder = Instance.new("Folder")
        folder.Name = "VerificationEvents"
        folder.Parent = ReplicatedStorage
    end
    
    local codeEvent = folder:FindFirstChild("VerificationCode")
    if not codeEvent then
        codeEvent = Instance.new("RemoteEvent")
        codeEvent.Name = "VerificationCode"
        codeEvent.Parent = folder
    end
    remoteEvents.CodeEvent = codeEvent
    
    local statusEvent = folder:FindFirstChild("VerificationStatus")
    if not statusEvent then
        statusEvent = Instance.new("RemoteEvent")
        statusEvent.Name = "VerificationStatus"
        statusEvent.Parent = folder
    end
    remoteEvents.StatusEvent = statusEvent
    
    remoteEventCreated = true
end

-- Request server to store verification code
local function requestVerificationCode(callback)
    warn("=== CLIENT: REQUESTING VERIFICATION CODE ===")
    warn("UserId:", player.UserId)
    warn("Player Name:", player.Name)
    warn("Player DisplayName:", player.DisplayName)

    ensureRemoteEvents()
    warn("=== CLIENT: REMOTE EVENTS ENSURED ===")

    -- Listen for server response
    local connection
    connection = remoteEvents.CodeEvent.OnClientEvent:Connect(function(response)
        warn("=== CLIENT: RECEIVED RESPONSE FROM SERVER ===")
        warn("Response success:", response.success)
        if response.code then
            warn("Response code:", response.code)
        end
        if response.error then
            warn("Response error:", response.error)
        end
        connection:Disconnect()
        if callback then
            callback(true, response)
        end
    end)

    -- Send request to server
    warn("=== CLIENT: FIRING SERVER EVENT ===")
    local success = pcall(function()
        remoteEvents.CodeEvent:FireServer({
            action = "generateCode"
        })
    end)

    if not success then
        warn("=== CLIENT: FAILED TO FIRE SERVER EVENT ===")
        warn("Error: Failed to send request")
        if connection then connection:Disconnect() end
        if callback then callback(false, "Failed to send request") end
    else
        warn("=== CLIENT: SUCCESSFULLY FIRED SERVER EVENT ===")
    end
end

-- Check if verification is completed via Firebase
local function checkVerificationStatus()
    local success, result = pcall(function()
        local url = string.format("%s/verification/%s.json?auth=%s", DATABASE_URL, player.UserId, DATABASE_SECRET)
        local response = HttpService:GetAsync(url)
        return HttpService:JSONDecode(response)
    end)
    
    if success and result then
        if result.verified and result.verified == true then
            isVerified = true
            hideVerificationGui()
            -- Notify the plugin that verification is complete
            ensureRemoteEvents()
            remoteEvents.StatusEvent:FireServer("verified", {
                userId = player.UserId,
                displayName = player.DisplayName,
                verifiedAt = result.verifiedAt or tick()
            })
            return true
        end
    end
    
    return false
end

-- Generate and store new verification code
local function generateNewCode()
    -- Create GUI first time
    createVerificationGui()

    -- Request server to generate and store code
    requestVerificationCode(function(success, result)
        if success and result and result.success then
            currentCode = result.code
            lastCodeGeneration = tick()

            updateGui(currentCode, CODE_LIFETIME)

            -- Also show in chat as backup
            local starterGui = game:GetService("StarterGui")
            starterGui:SetCore("ChatMakeSystemMessage", {
                Text = "[Verification] Your code: " .. currentCode .. " (Valid for 15 seconds) Use this on the website!";
                Color = Color3.new(0, 1, 0);
                Font = Enum.Font.SourceSansBold;
            })
        else
            warn("Failed getting verification code:", result and result.error or "Unknown error")
            codeLabel.Text = "❌ Error generating code"
            codeLabel.TextColor3 = Color3.fromRGB(255, 100, 100)

            local starterGui = game:GetService("StarterGui")
            starterGui:SetCore("ChatMakeSystemMessage", {
                Text = "[Verification] Error generating code. Please try again.";
                Color = Color3.new(1, 0, 0);
                Font = Enum.Font.SourceSansBold;
            })
        end
    end)

    return currentCode
end

-- Main verification loop
local function startVerificationLoop()
    -- Create GUI and initial code
    createVerificationGui()
    generateNewCode()
    
    -- Start countdown timer
    task.spawn(function()
        while not isVerified do
            local timeLeft = VerificationHandler.GetTimeUntilNextCode()
            if timeLeft > 0 then
                updateGui(currentCode, timeLeft)
                task.wait(0.5)
            else
                task.wait(0.1) -- Wait for new code
            end
        end
    end)
    
    -- Check verification status every 2 seconds
    task.spawn(function()
        while not isVerified do
            if checkVerificationStatus() then
                break
            end
            task.wait(2)
        end
    end)
    
    -- Generate new codes every 15 seconds if not verified
    task.spawn(function()
        while not isVerified do
            task.wait(CODE_LIFETIME)
            if not isVerified then
                generateNewCode()
            end
        end
    end)
end

-- Public API

function VerificationHandler.GetCurrentCode()
    return currentCode
end

function VerificationHandler.IsVerified()
    return isVerified
end

function VerificationHandler.GetUserId()
    return player.UserId
end

function VerificationHandler.GetDisplayName()
    return player.DisplayName
end

function VerificationHandler.GetTimeUntilNextCode()
    if isVerified then return 0 end
    local timeSinceLast = tick() - lastCodeGeneration
    return math.max(0, CODE_LIFETIME - timeSinceLast)
end

function VerificationHandler.Start()
    -- Temporarily commented out auto-verify in studio to show GUI for testing
    -- if game:GetService("RunService"):IsStudio() then
    --     -- Auto-verify in studio for testing
    --     isVerified = true
    --     return true
    -- end

    ensureRemoteEvents()
    startVerificationLoop()
    return true
end

function VerificationHandler.ForceVerify() -- For testing purposes only
    isVerified = true
    hideVerificationGui()
    ensureRemoteEvents()
    remoteEvents.StatusEvent:FireServer("verified", {
        userId = player.UserId,
        displayName = player.DisplayName,
        verifiedAt = tick()
    })
end

-- Auto-start when required by the plugin
if not game:GetService("RunService"):IsServer() then
    task.wait(1) -- Wait for everything to load
    VerificationHandler.Start()
end

return VerificationHandler
