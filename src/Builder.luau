local Builder = {}

local function parseValue(instance, propName, value)
	local success, currentVal = pcall(function() return instance[propName] end)
	if not success then return nil end

	local targetType = typeof(currentVal)

	if targetType == "number" then
		local num = tonumber(value)
		if num then return num end
		
		-- Try to extract number from string
		local extracted = value:match("([%d%.%-]+)")
		return tonumber(extracted) or 0
	elseif targetType == "boolean" then
		if type(value) == "string" then
			local lowerVal = value:lower()
			return lowerVal == "true" or lowerVal == "yes" or lowerVal == "1"
		end
		return value == true
	elseif targetType == "Color3" then
		-- Support multiple color formats
		-- RGB format: "255,0,0"
		local r, g, b = value:match("^(%d+),(%d+),(%d+)$")
		if r then 
			return Color3.fromRGB(tonumber(r), tonumber(g), tonumber(b)) 
		end
		
		-- Hex format: "#FF0000" or "FF0000"
		local hex = value:match("#?([%da-fA-F][%da-fA-F][%da-fA-F][%da-fA-F][%da-fA-F][%da-fA-F])")
		if hex then
			local r = tonumber(hex:sub(1,2), 16)
			local g = tonumber(hex:sub(3,4), 16)
			local b = tonumber(hex:sub(5,6), 16)
			return Color3.fromRGB(r, g, b)
		end
		
		-- Try to parse Color3.fromRGB() function call
		local rgbCall = value:match("Color3%.fromRGB%((%d+),%s*(%d+),%s*(%d+)%)")
		if rgbCall then
			return Color3.fromRGB(tonumber(rgbCall), tonumber(rgbCall), tonumber(rgbCall))
		end
		
		-- Try to parse Color3.new() function call (0-1 range)
		local newCall = value:match("Color3%.new%(([%d%.]+),%s*([%d%.]+),%s*([%d%.]+)%)")
		if newCall then
			return Color3.new(tonumber(newCall), tonumber(newCall), tonumber(newCall))
		end
		
		warn(string.format("Could not parse Color3 value: %s", tostring(value)))
		return Color3.new(1, 1, 1) -- Default to white
	elseif targetType == "Vector3" then
		-- Support multiple Vector3 formats
		-- Standard format: "1,2,3"
		local x, y, z = value:match("^([%d%.%-]+),([%d%.%-]+),([%d%.%-]+)$")
		if x then 
			return Vector3.new(tonumber(x), tonumber(y), tonumber(z)) 
		end
		
		-- Try to parse Vector3.new() function call
		local newCall = value:match("Vector3%.new%(([%d%.%-]+),%s*([%d%.%-]+),%s*([%d%.%-]+)%)")
		if newCall then
			return Vector3.new(tonumber(newCall), tonumber(newCall), tonumber(newCall))
		end
		
		warn(string.format("Could not parse Vector3 value: %s", tostring(value)))
		return Vector3.new(0, 0, 0)
	elseif targetType == "CFrame" then
		-- Support multiple CFrame formats
		-- Position only: "1,2,3"
		local x, y, z = value:match("^([%d%.%-]+),([%d%.%-]+),([%d%.%-]+)$")
		if x then 
			return CFrame.new(tonumber(x), tonumber(y), tonumber(z)) 
		end
		
		-- Try to parse CFrame.new() function call with position only
		local posCall = value:match("CFrame%.new%(([%d%.%-]+),%s*([%d%.%-]+),%s*([%d%.%-]+)%)")
		if posCall then
			return CFrame.new(tonumber(posCall), tonumber(posCall), tonumber(posCall))
		end
		
		-- Try to parse CFrame.new() with position and rotation
		local fullCall = value:match("CFrame%.new%(([%d%.%-]+),%s*([%d%.%-]+),%s*([%d%.%-]+),%s*([%d%.%-]+),%s*([%d%.%-]+),%s*([%d%.%-]+)%)")
		if fullCall then
			return CFrame.new(
				tonumber(fullCall), tonumber(fullCall), tonumber(fullCall),
				tonumber(fullCall), tonumber(fullCall), tonumber(fullCall)
			)
		end
		
		-- Full matrix format (12 components)
		local components = {}
		for num in value:gmatch("([%d%.%-]+)") do
			table.insert(components, tonumber(num))
		end
		if #components >= 12 then
			return CFrame.new(unpack(components))
		end
		
		warn(string.format("Could not parse CFrame value: %s", tostring(value)))
		return CFrame.new(0, 0, 0)
	elseif targetType == "UDim2" then
		-- Full format: "{0.5,0},{0.5,0}"
		local xs, xo, ys, yo = value:match("^{([%d%.%-]+),%s*([%d%.%-]+)},%s*{([%d%.%-]+),%s*([%d%.%-]+)}")
		if xs then 
			return UDim2.new(tonumber(xs), tonumber(xo), tonumber(ys), tonumber(yo)) 
		end
		
		-- Simplified format: "0.5,0,0.5,0"
		local xs2, xo2, ys2, yo2 = value:match("^([%d%.%-]+),([%d%.%-]+),([%d%.%-]+),([%d%.%-]+)$")
		if xs2 then 
			return UDim2.new(tonumber(xs2), tonumber(xo2), tonumber(ys2), tonumber(yo2)) 
		end
		
		-- Try to parse UDim2.new() function call
		local newCall = value:match("UDim2%.new%(([%d%.%-]+),%s*([%d%.%-]+),%s*([%d%.%-]+),%s*([%d%.%-]+)%)")
		if newCall then
			return UDim2.new(tonumber(newCall), tonumber(newCall), tonumber(newCall), tonumber(newCall))
		end
		
		warn(string.format("Could not parse UDim2 value: %s", tostring(value)))
		return UDim2.new(0, 0, 0, 0)
	elseif targetType == "string" then
		return tostring(value)
	elseif targetType == "EnumItem" then
		-- Enhanced enum parsing
		if type(value) == "string" then
			-- Try explicit Enum format: "Enum.Material.Neon"
			local enumType, enumItem = value:match("^Enum%.([%w_]+)%.([%w_]+)$")
			if enumType and enumItem then
				local enumSuccess, enumResult = pcall(function() return Enum[enumType][enumItem] end)
				if enumSuccess then 
					return enumResult 
				else
					warn(string.format("Invalid enum: %s.%s", enumType, enumItem))
				end
			end
			
			-- Try to find enum by name in common enum types
			local commonEnums = {
				"Material", "BrickColor", "Shape", "SizeConstraint", "Style", 
				"Font", "TextXAlignment", "TextYAlignment", "TextTruncate",
				"HorizontalAlignment", "VerticalAlignment", "FillDirection",
				"SortOrder", "EasingDirection", "EasingStyle", "AnimationPriority"
			}
			
			for _, enumName in ipairs(commonEnums) do
				local enumSuccess, enumResult = pcall(function() return Enum[enumName][value] end)
				if enumSuccess then 
					return enumResult 
				end
			end
			
			-- Fallback: return the string (Roblox might accept it)
			return value
		end
		return value 
	end

	warn(string.format("Unsupported property type %s for property %s with value %s", targetType, propName, tostring(value)))
	return value
end

-- Determine the correct parent based on asset type
local function getParentForAsset(className, name)
	local classNameLower = className:lower()
	local nameLower = name and name:lower() or ""
	
	-- GUI Elements go to StarterGui
	if classNameLower == "screengui" or classNameLower == "guiservice" or 
	   classNameLower == "frame" or classNameLower == "textbutton" or 
	   classNameLower == "textlabel" or classNameLower == "imagebutton" or
	   classNameLower == "imagelabel" or classNameLower == "textbox" or
	   classNameLower == "uigridlayout" or classNameLower == "uilistlayout" or
	   classNameLower == "uicorner" or classNameLower == "uistroke" or
	   classNameLower == "uipadding" or classNameLower == "uiaspectratioconstraint" or
	   (nameLower:find("gui") or nameLower:find("ui") or nameLower:find("screen")) then
		return game:GetService("StarterGui")
	end
	
	-- Server Scripts go to ServerScriptService
	if classNameLower == "script" or 
	   (nameLower:find("server") and classNameLower == "script") or
	   nameLower:find("server") then
		return game:GetService("ServerScriptService")
	end
	
	-- Client Scripts go to StarterPlayerScripts
	if classNameLower == "localscript" or 
	   (nameLower:find("client") and classNameLower == "localscript") or
	   nameLower:find("client") then
		return game:GetService("StarterPlayer"):WaitForChild("StarterPlayerScripts")
	end
	
	-- Modules go to ReplicatedStorage
	if classNameLower == "modulescript" or nameLower:find("module") then
		return game:GetService("ReplicatedStorage")
	end
	
	-- VFX (ParticleEmitters, Beams, etc.) go to Workspace or Lighting
	if classNameLower == "particleemitter" or classNameLower == "beam" or 
	   classNameLower == "trail" or classNameLower == "attachment" or
	   nameLower:find("vfx") or nameLower:find("particle") or nameLower:find("effect") then
		return game.Workspace
	end
	
	-- Lighting effects go to Lighting
	if classNameLower == "light" or classNameLower == "atmosphere" or
	   nameLower:find("lighting") or nameLower:find("atmosphere") then
		return game:GetService("Lighting")
	end
	
	-- Animations go to StarterPlayer
	if classNameLower == "animation" then
		return game:GetService("StarterPlayer"):WaitForChild("StarterCharacterScripts")
	end
	
	-- Models and Parts go to Workspace
	if classNameLower == "model" or classNameLower == "part" or 
	   classNameLower == "meshpart" or classNameLower == "union" or
	   classNameLower == "trusspart" or classNameLower == "wedgepart" or
	   classNameLower == "spawnlocation" or classNameLower == "baseplate" then
		return game.Workspace
	end
	
	-- Default to Workspace
	return game.Workspace
end

function Builder.Build(data)
	local createdInstances = {}
	local buildStats = {
		totalAssets = 0,
		successfulAssets = 0,
		failedAssets = 0,
		warnings = {}
	}
	
	-- Enhanced validation
	if not data or not data.assets or type(data.assets) ~= "table" then
		warn("Builder.Build: Invalid data structure - missing or invalid assets array")
		return {}
	end
	
	buildStats.totalAssets = #data.assets
	
	local function create(assetData, parent, depth)
		-- Prevent infinite recursion
		if depth and depth > 50 then
			warn("Builder.Build: Maximum nesting depth exceeded")
			return nil
		end
		depth = (depth or 0) + 1
		
		-- Validate asset data
		if not assetData or not assetData.ClassName then
			warn("Builder.Build: Invalid asset data - missing ClassName")
			buildStats.failedAssets = buildStats.failedAssets + 1
			return nil
		end
		
		local success, instance = pcall(function()
			return Instance.new(assetData.ClassName)
		end)

		if not success then
			local errorMsg = string.format("Failed to create class: %s - %s", tostring(assetData.ClassName), tostring(instance))
			warn(errorMsg)
			table.insert(buildStats.warnings, errorMsg)
			buildStats.failedAssets = buildStats.failedAssets + 1
			return nil
		end
		
		-- Set instance name early for better error reporting
		if assetData.Properties and assetData.Properties.Name then
			instance.Name = tostring(assetData.Properties.Name)
		end

		-- Enhanced property setting with validation
		if assetData.Properties and type(assetData.Properties) == "table" then
			for k, v in pairs(assetData.Properties) do
				local propSuccess, propError = pcall(function()
					local val = parseValue(instance, k, v)
					if val ~= nil then
						instance[k] = val
					else
						-- Try direct assignment as fallback
						instance[k] = v
					end
				end)
				
				if not propSuccess then
					local warningMsg = string.format("Failed to set property %s on %s: %s", tostring(k), instance:GetFullName(), tostring(propError))
					warn(warningMsg)
					table.insert(buildStats.warnings, warningMsg)
				end
			end
		end

		-- Create children recursively with error handling
		if assetData.Children and type(assetData.Children) == "table" then
			for i, child in ipairs(assetData.Children) do
				local childSuccess, childInstance = pcall(function()
					return create(child, instance, depth)
				end)
				
				if childSuccess and childInstance then
					childInstance.Parent = instance
				elseif not childSuccess then
					local warningMsg = string.format("Failed to create child %d of %s: %s", i, instance:GetFullName(), tostring(childInstance))
					warn(warningMsg)
					table.insert(buildStats.warnings, warningMsg)
				end
			end
		end

		buildStats.successfulAssets = buildStats.successfulAssets + 1
		return instance
	end

	-- Process each asset with enhanced error handling
	for i, asset in ipairs(data.assets) do
		local success, instance = pcall(function()
			return create(asset, nil, 0)
		end)
		
		if success and instance then
			-- Determine correct parent based on asset type
			local parentSuccess, correctParent = pcall(function()
				return getParentForAsset(asset.ClassName, asset.Properties and asset.Properties.Name)
			end)
			
			if parentSuccess and correctParent then
				instance.Parent = correctParent
				table.insert(createdInstances, instance)
			else
				local warningMsg = string.format("Failed to determine parent for asset %d (%s), using Workspace", i, tostring(asset.ClassName))
				warn(warningMsg)
				table.insert(buildStats.warnings, warningMsg)
				instance.Parent = workspace -- Fallback to workspace
				table.insert(createdInstances, instance)
			end
		else
			local errorMsg = string.format("Failed to create asset %d: %s", i, tostring(instance))
			warn(errorMsg)
			table.insert(buildStats.warnings, errorMsg)
		end
	end
	
	-- Log build statistics
	print(string.format("Builder.Build completed: %d/%d assets created successfully", buildStats.successfulAssets, buildStats.totalAssets))
	if #buildStats.warnings > 0 then
		print("Builder warnings:")
		for _, warning in ipairs(buildStats.warnings) do
			print("  - " .. warning)
		end
	end

	return createdInstances
end

return Builder
