local ChangeHistoryService = game:GetService("ChangeHistoryService")
local Selection = game:GetService("Selection")
local Network = require(script.Parent.Network)
local Builder = require(script.Parent.Builder)

-- New function to serialize the game tree
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

local statusLabel = Instance.new("TextLabel")
statusLabel.Size = UDim2.new(0.9, 0, 0, 30)
statusLabel.BackgroundColor3 = Color3.fromRGB(50,50,50)
statusLabel.TextColor3 = Color3.fromRGB(255,100,100)
statusLabel.Text = "Disconnected"
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

-- Set initial token
Network.SetToken(tokenBox.Text)

tokenBox:GetPropertyChangedSignal("Text"):Connect(function()
	local newToken = tokenBox.Text
	Network.SetToken(newToken)
	plugin:SetSetting("RobloxGenToken", newToken)
end)

-- Sync Button
local syncButton = Instance.new("TextButton")
syncButton.Size = UDim2.new(0.9, 0, 0, 30)
syncButton.BackgroundColor3 = Color3.fromRGB(0, 120, 215)
syncButton.TextColor3 = Color3.fromRGB(255,255,255)
syncButton.Text = "Sync Project to Web"
syncButton.Font = Enum.Font.SourceSansBold
syncButton.TextSize = 16
syncButton.Parent = gui
local uiCornerSync = Instance.new("UICorner")
uiCornerSync.Parent = syncButton

syncButton.MouseButton1Click:Connect(function()
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
logLabel.Parent = gui

local logScroll = Instance.new("ScrollingFrame")
logScroll.Size = UDim2.new(0.9, 0, 1, -120) -- Adjusted size for sync button
logScroll.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
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
        -- Only poll if enabled
        if widget.Enabled then
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

if widget.Enabled then
    isPolling = true
    task.spawn(loop)
end