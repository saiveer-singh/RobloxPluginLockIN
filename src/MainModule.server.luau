local ChangeHistoryService = game:GetService("ChangeHistoryService")
local Selection = game:GetService("Selection")
local Network = require(script.Parent.Network)
local Builder = require(script.Parent.Builder)

local toolbar = plugin:CreateToolbar("RobloxGenAI")
local button = toolbar:CreateButton("Toggle", "Toggle AI Panel", "") -- Empty string for icon (no custom icon)

local widgetInfo = DockWidgetPluginGuiInfo.new(
	Enum.InitialDockState.Float,
	false,   -- enabled initially
	false,  -- overrides previous enabled
	200,    -- float x
	300,    -- float y
	150,    -- min x
	150     -- min y
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

local logLabel = Instance.new("TextLabel")
logLabel.Size = UDim2.new(0.9, 0, 0, 20)
logLabel.BackgroundTransparency = 1
logLabel.TextColor3 = Color3.fromRGB(200,200,200)
logLabel.Text = "Logs:"
logLabel.TextXAlignment = Enum.TextXAlignment.Left
logLabel.Parent = gui

local logScroll = Instance.new("ScrollingFrame")
logScroll.Size = UDim2.new(0.9, 0, 1, -80)
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
            local data = Network.Poll()

            if data then
                updateStatus(true)
                if data.commands and #data.commands > 0 then
                    for _, cmd in ipairs(data.commands) do
                        addLog("Processing: " .. (cmd.message or "Unknown"))

                        local success, err = pcall(function()
                            local instances = Builder.Build(cmd)
                            if instances and #instances > 0 then
                                -- Instances are already placed in correct hierarchy by Builder
                                Selection:Set(instances)
                                ChangeHistoryService:SetWaypoint("AI Generation")
                                addLog("Created " .. #instances .. " instance(s) in correct hierarchy")
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
                addLog("Connection failed - check token and server")
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
	else
        -- We don't stop the loop variable so it resumes easily, 
        -- but inside the loop we check enabled.
        -- Or we can stop it.
        -- isPolling = false
	end
end)

-- Start loop if enabled on load (unlikely for dock widgets but good practice)
if widget.Enabled then
    isPolling = true
    task.spawn(loop)
end

