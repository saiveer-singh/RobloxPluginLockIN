-- Ensure this only runs on the server
if not game:GetService("RunService"):IsServer() then return end

local ChangeHistoryService = game:GetService("ChangeHistoryService")
local Selection = game:GetService("Selection")
local Network = require(script.Parent.Network)
local Builder = require(script.Parent.Builder)
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")

-- Firebase configuration
local DATABASE_URL = "https://tissueai-coins-default-rtdb.firebaseio.com"
local DATABASE_SECRET = "JndkJy6Vg3hMYskq6eUreOM8RquD4jBHJw0mrXAg"
local CODE_LIFETIME = 15 -- seconds

-- Server-side Firebase functions for verification
local function storeVerificationCode(userId, code, displayName)
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
        
        warn("=== SERVER: STORING VERIFICATION CODE ===")
        warn("UserId:", userId)
        warn("Code:", code)
        warn("Expires:", data.expires)
        warn("URL:", url)
        
        local response = HttpService:PostAsync(url, HttpService:JSONEncode(data))
        local decoded = HttpService:JSONDecode(response)
        warn("Firebase response:", decoded)
        return decoded
    end)
    
    if not success then
        warn("=== SERVER: FAILED TO STORE VERIFICATION CODE ===")
        warn("Error:", tostring(result))
    else
        warn("=== SERVER: SUCCESSFULLY STORED VERIFICATION CODE ===")
    end
    
    return success, result
end

-- Create RemoteEvents folder and handlers
local function setupVerificationRemotes()
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
    
    local statusEvent = folder:FindFirstChild("VerificationStatus")
    if not statusEvent then
        statusEvent = Instance.new("RemoteEvent")
        statusEvent.Name = "VerificationStatus"
        statusEvent.Parent = folder
    end
    
    -- Handle code generation requests from client
    codeEvent.OnServerEvent:Connect(function(player, requestData)
        warn("=== SERVER: RECEIVED VERIFICATION REQUEST FROM ===" .. player.Name)
        if requestData and requestData.action == "generateCode" then
            -- Generate random code
            local chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            local code = ""
            for i = 1, 6 do
                local rand = math.random(1, #chars)
                code = code .. string.sub(chars, rand, rand)
            end

            warn("=== SERVER: GENERATED CODE ===" .. code)

            -- Store in Firebase
            local success = storeVerificationCode(player.UserId, code, player.DisplayName)

            -- Send back to client
            if success then
                warn("=== SERVER: SENDING SUCCESS RESPONSE TO CLIENT ===")
                codeEvent:FireClient(player, {
                    success = true,
                    code = code,
                    expires = tick() + CODE_LIFETIME
                })
            else
                warn("=== SERVER: SENDING FAILURE RESPONSE TO CLIENT ===")
                codeEvent:FireClient(player, {
                    success = false,
                    error = "Failed to store verification code"
                })
            end
        end
    end)
end

-- New function to serialize game tree
local function serializeGameTree()
    local services = {
        game.Workspace,
        game.Lighting,
        game.ReplicatedFirst,
        game.ReplicatedStorage,
        game.ServerScriptService,
        game.ServerStorage,
        game.StarterGui,
        game.StarterPack,
        game.StarterPlayer,
        game.SoundService,
        game.Chat
        -- Add others as needed
    }

    local function serializeInstance(inst)
        local node = {
            id = inst:GetDebugId(0), -- Not stable across sessions but good enough for tree diff
            name = inst.Name,
            className = inst.ClassName,
            children = {},
            properties = {} -- Populate minimal properties if needed
        }
        
        -- Populate Source property for Scripts (essential for AI editing)
        if inst:IsA("Script") or inst:IsA("LocalScript") or inst:IsA("ModuleScript") then
             -- Be careful with large sources
             -- node.properties.Source = inst.Source 
             -- For now, let's send it so AI can edit it. 
             -- In prod, might want to truncate or only send on demand.
             -- But "Sync" implies sending state.
             node.properties.Source = inst.Source
        end
        
        -- Basic properties
        pcall(function()
             if inst:IsA("BasePart") then
                 node.properties.Position = tostring(inst.Position)
                 node.properties.Size = tostring(inst.Size)
                 node.properties.Color = tostring(inst.Color)
             end
        end)

        for _, child in ipairs(inst:GetChildren()) do
            table.insert(node.children, serializeInstance(child))
        end
        return node
    end

    local tree = {}
    for _, service in ipairs(services) do
        table.insert(tree, serializeInstance(service))
    end
    
    return tree
end

-- Setup verification remotes first
setupVerificationRemotes()

local toolbar = plugin:CreateToolbar("RobloxGenAI")
local button = toolbar:CreateButton("Toggle", "Toggle AI Panel", "") 

local widgetInfo = DockWidgetPluginGuiInfo.new(
	Enum.InitialDockState.Float,
	false,   
	false,  
	200,    
	300,    
	150,    
	150     
)

local widget = plugin:CreateDockWidgetPluginGui("RobloxGenAIParams", widgetInfo)
widget.Title = "RobloxGen AI"

-- Verification state
local isVerified = false
local verifiedUserId = nil
local verificationStatus = "Not Verified"

-- Create UI
local gui = Instance.new("Frame")
gui.Size = UDim2.new(1,0,1,0)
gui.BackgroundColor3 = Color3.fromRGB(35, 35, 35)
gui.Parent = widget

local listLayout = Instance.new("UIListLayout")
listLayout.Padding = UDim.new(0, 5)
listLayout.Parent = gui
listLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center

local padding = Instance.new("UIPadding")
padding.PaddingTop = UDim.new(0, 10)
padding.Parent = gui

-- Verification Status
local verificationLabel = Instance.new("TextLabel")
verificationLabel.Size = UDim2.new(0.9, 0, 0, 30)
verificationLabel.BackgroundColor3 = Color3.fromRGB(50,50,50)
verificationLabel.TextColor3 = Color3.fromRGB(255,255,100)
verificationLabel.Text = "Verification Required"
verificationLabel.Font = Enum.Font.SourceSansBold
verificationLabel.TextSize = 16
verificationLabel.Parent = gui
local verificationCorner = Instance.new("UICorner")
verificationCorner.Parent = verificationLabel

local statusLabel = Instance.new("TextLabel")
statusLabel.Size = UDim2.new(0.9, 0, 0, 30)
statusLabel.BackgroundColor3 = Color3.fromRGB(50,50,50)
statusLabel.TextColor3 = Color3.fromRGB(255,100,100)
statusLabel.Text = "Not Connected"
statusLabel.Font = Enum.Font.SourceSansBold
statusLabel.TextSize = 18
statusLabel.Parent = gui
local uiCorner = Instance.new("UICorner")
uiCorner.Parent = statusLabel

local tokenLabel = Instance.new("TextLabel")
tokenLabel.Size = UDim2.new(0.9, 0, 0, 20)
tokenLabel.BackgroundTransparency = 1
tokenLabel.TextColor3 = Color3.fromRGB(200,200,200)
tokenLabel.Text = "Plugin Token:"
tokenLabel.TextXAlignment = Enum.TextXAlignment.Left
tokenLabel.Parent = gui

local tokenBox = Instance.new("TextBox")
tokenBox.Size = UDim2.new(0.9, 0, 0, 30)
tokenBox.BackgroundColor3 = Color3.fromRGB(40,40,40)
tokenBox.TextColor3 = Color3.fromRGB(255,255,255)
tokenBox.Text = plugin:GetSetting("RobloxGenToken") or ""
tokenBox.PlaceholderText = "Paste your token here"
tokenBox.Font = Enum.Font.SourceSans
tokenBox.TextSize = 14
tokenBox.Parent = gui
local uiCorner2 = Instance.new("UICorner")
uiCorner2.Parent = tokenBox

-- Verification status display
local function updateVerificationStatus()
    if isVerified then
        verificationLabel.Text = "✓ Verified"
        verificationLabel.TextColor3 = Color3.fromRGB(100,255,100)
        verificationStatus = "Verified as " .. (verifiedUserId or "Unknown")
        
        -- Enable token input and sync button
        tokenBox.Visible = true
        statusLabel.Visible = true
        
        -- Set initial token if verified
        local storedToken = plugin:GetSetting("RobloxGenToken") or ""
        Network.SetToken(storedToken)
        tokenBox.Text = storedToken
    else
        verificationLabel.Text = "✗ Verification Required"
        verificationLabel.TextColor3 = Color3.fromRGB(255,100,100)
        verificationStatus = "Please verify on the website first"
        
        -- Disable token input and sync button
        tokenBox.Visible = false
        statusLabel.Visible = false
    end
end

-- Set initial token (only if verified)
Network.SetToken(tokenBox.Text)

tokenBox:GetPropertyChangedSignal("Text"):Connect(function()
	local newToken = tokenBox.Text
	Network.SetToken(newToken)
	plugin:SetSetting("RobloxGenToken", newToken)
end)

-- Listen for verification events from VerificationHandler
local verificationEvents = ReplicatedStorage:FindFirstChild("VerificationEvents")
if verificationEvents then
    local statusEvent = verificationEvents:FindFirstChild("VerificationStatus")
    if statusEvent then
        statusEvent.OnServerEvent:Connect(function(status, data)
            if status == "verified" then
                isVerified = true
                verifiedUserId = data.userId
                updateVerificationStatus()
            end
        end)
    end
end

-- Check verification status
local function checkVerificationStatus()
    -- Try to load VerificationHandler and check status
    local success, verificationHandler = pcall(function()
        return require(script.Parent.VerificationHandler)
    end)
    
    if success and verificationHandler then
        isVerified = verificationHandler.IsVerified()
        if isVerified then
            verifiedUserId = verificationHandler.GetUserId()
        end
        updateVerificationStatus()
    end
end

-- Sync Button
local syncButton = Instance.new("TextButton")
syncButton.Size = UDim2.new(0.9, 0, 0, 30)
syncButton.BackgroundColor3 = Color3.fromRGB(0, 120, 215)
syncButton.TextColor3 = Color3.fromRGB(255,255,255)
syncButton.Text = "Sync Project to Web"
syncButton.Font = Enum.Font.SourceSansBold
syncButton.TextSize = 16
syncButton.Parent = gui
syncButton.Visible = false -- Initially hidden until verified
local uiCornerSync = Instance.new("UICorner")
uiCornerSync.Parent = syncButton

syncButton.MouseButton1Click:Connect(function()
    if not isVerified then
        warn("Cannot sync: User not verified")
        return
    end
    
    statusLabel.Text = "Syncing..."
    local tree = serializeGameTree()
    Network.SyncProject(tree)
    statusLabel.Text = "Synced!"
    wait(2)
    statusLabel.Text = "Connected"
end)

local logLabel = Instance.new("TextLabel")
logLabel.Size = UDim2.new(0.9, 0, 0, 20)
logLabel.BackgroundTransparency = 1
logLabel.TextColor3 = Color3.fromRGB(200,200,200)
logLabel.Text = "Logs:"
logLabel.TextXAlignment = Enum.TextXAlignment.Left
logLabel.Visible = false -- Initially hidden until verified
logLabel.Parent = gui

local logScroll = Instance.new("ScrollingFrame")
logScroll.Size = UDim2.new(0.9, 0, 1, -120) -- Adjusted size for sync button
logScroll.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
logScroll.Visible = false -- Initially hidden until verified
logScroll.Parent = gui
local logList = Instance.new("UIListLayout")
logList.Parent = logScroll

local isPolling = false

local function addLog(text)
	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(1, 0, 0, 20)
	label.BackgroundTransparency = 1
	label.TextColor3 = Color3.fromRGB(200,200,200)
	label.Text = text
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.Parent = logScroll
    logScroll.CanvasPosition = Vector2.new(0, 9999)
end

local function updateStatus(connected)
	if connected then
		statusLabel.Text = "Connected"
		statusLabel.TextColor3 = Color3.fromRGB(100,255,100)
	else
		statusLabel.Text = "Disconnected"
		statusLabel.TextColor3 = Color3.fromRGB(255,100,100)
	end
end

local function loop()
	while isPolling do
        -- Only poll if enabled and verified
        if widget.Enabled and isVerified then
            Network.SendHeartbeat()
            local data, err = Network.Poll()

            if data then
                updateStatus(true)
                if data.commands and #data.commands > 0 then
                    for _, cmd in ipairs(data.commands) do
                        addLog("Processing: " .. (cmd.message or "Unknown"))

                        local success, err = pcall(function()
                            local instances = Builder.Build(cmd)
                            if instances and #instances > 0 then
                                Selection:Set(instances)
                                ChangeHistoryService:SetWaypoint("AI Generation")
                                addLog("Created " .. #instances .. " instance(s)")
                                
                                -- Auto-sync after generation so web sees it immediately
                                local tree = serializeGameTree()
                                Network.SyncProject(tree)
                            end
                        end)

                        if success then
                            addLog("✔ Success")
                        else
                            addLog("❌ Error: " .. tostring(err))
                            warn(err)
                        end
                    end
                end
            else
                -- If we get nil, it might be a connection error
                updateStatus(false)
                if err then
                    addLog("Connection failed: " .. tostring(err))
                else
                    addLog("Connection failed - check token and server")
                end
            end
        end
		task.wait(2)
	end
end

button.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)

widget:GetPropertyChangedSignal("Enabled"):Connect(function()
	if widget.Enabled then
		if not isPolling then
			isPolling = true
			task.spawn(loop)
		end
	end
end)

-- Check verification status on load
task.spawn(function()
    wait(1) -- Wait for everything to load
    checkVerificationStatus()
    
    -- Enable UI components based on verification status
    if isVerified then
        syncButton.Visible = true
        logLabel.Visible = true
        logScroll.Visible = true
        statusLabel.Visible = true
        tokenBox.Visible = true
        
        if widget.Enabled and not isPolling then
            isPolling = true
            task.spawn(loop)
        end
    end
end)

if widget.Enabled and isVerified then
    isPolling = true
    task.spawn(loop)
end
