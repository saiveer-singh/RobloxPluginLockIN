# RobloxGen AI System

This system allows you to generate Roblox assets using AI commands from a web interface and automatically insert them into Roblox Studio.

## Components
1. **Web App**: Next.js application with Chat UI and AI processing.
2. **Plugin**: Roblox Studio plugin that connects to the Web App.

## Setup

### 1. Web App
1. Navigate to `web/` directory.
2. Run `npm install`.
3. Ensure `api-keys.json` has your valid keys (or set environment variables).
4. Run `npm run dev` to start the server on `http://localhost:3000`.

### 2. Roblox Plugin
1. You need [Rojo](https://rojo.space/) installed.
2. Run `rojo build -o RobloxGenAI.rbxmx` in the root directory.
3. Drag `RobloxGenAI.rbxmx` into Roblox Studio (Plugins folder or just workspace to test).
   - Alternatively, use `rojo serve` and connect via the Rojo plugin in Studio, but building the file is easier for a standalone plugin.
4. **Important**: You must enable **HTTP Requests** in Roblox Studio (Home -> Game Settings -> Security -> Allow HTTP Requests).
5. Open the Plugin tab, click "Toggle" to open the AI Panel.
6. Ensure the Status says "Connected" (The web server must be running).

## Usage
1. Type a command in the Web UI, e.g., "Create a red glowing sphere".
2. The AI generates the JSON.
3. The Plugin detects the command and inserts the object into Workspace.
