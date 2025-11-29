local HttpService = game:GetService("HttpService")
local Network = {}

-- Change this to your deployed URL if needed
local BASE_URL = "http://localhost:3000/api"

-- Token will be set from the UI
local token = ""

function Network.SetToken(newToken)
	token = newToken
end

function Network.Poll()
	if token == "" then return nil end
	local success, response = pcall(function()
		return HttpService:GetAsync(BASE_URL .. "/poll?token=" .. HttpService:UrlEncode(token), true) -- true for nocache
	end)

	if success then
		local data = HttpService:JSONDecode(response)
		return data
	else
		-- Return the error message so the UI can display it
		return nil, response
	end
end

function Network.SendHeartbeat()
	if token == "" then return end
	pcall(function()
		HttpService:PostAsync(BASE_URL .. "/status?token=" .. HttpService:UrlEncode(token), HttpService:JSONEncode({ connected = true }))
	end)
end

function Network.SyncProject(tree)
	if token == "" then return end
	pcall(function()
		HttpService:PostAsync(
			BASE_URL .. "/sync",
			HttpService:JSONEncode({
				token = token,
				tree = tree
			})
		)
	end)
end

return Network