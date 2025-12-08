export const BASE_SCHEMA = `
CRITICAL FORMATTING RULES:
1. Your ENTIRE response must be valid JSON
2. Do NOT use markdown code blocks (no \`\`\`json or \`\`\`)
3. Do NOT include any text before or after the JSON
4. The JSON must start with { and end with }
5. All property values must be properly quoted strings

OUTPUT FORMAT (copy this structure exactly):
{
  "reasoning": "Your detailed thought process here...",
  "message": "Brief description of what was created",
  "assets": [
    {
      "ClassName": "Part",
      "Properties": {
        "Name": "ExamplePart",
        "Size": "4,4,4",
        "Position": "0,10,0"
      },
      "Children": []
    }
  ]
}

EXAMPLE VALID RESPONSE:
{
  "reasoning": "Creating a red glowing part requires: 1) A Part with Neon material, 2) Red color using Color3, 3) Proper size and position",
  "message": "Created a red glowing part",
  "assets": [
    {
      "ClassName": "Part",
      "Properties": {
        "Name": "GlowingPart",
        "Size": "4,4,4",
        "Material": "Enum.Material.Neon",
        "Color": "255,0,0",
        "Anchored": "true"
      },
      "Children": []
    }
  ]
}

ENHANCED PROPERTY RULES (CRITICAL):
- ALL values must be strings, even numbers and booleans
- Colors: "R,G,B" format (0-255) e.g., "255,0,0" for red
- Vectors: "X,Y,Z" format e.g., "4,4,4" for size
- UDim2: "{XS,XO},{YS,YO}" format e.g., "{0.5,0},{0.5,0}" for center
- CFrame: "X,Y,Z,RX,RY,RZ" format (position + rotation in radians)
- Enums: Use full string format like "Enum.Material.Neon" for clarity
- Booleans: "true" or "false" as strings
- Numbers: String representation e.g., "10" not 10
- For Scripts: Put complete, production-ready Luau source code in "Source" property
- Names: Use descriptive, following Roblox naming conventions

ADVANCED HIERARCHY PLACEMENT (Intelligent):
- ScreenGui, Frame, TextButton, ImageButton, etc. → StarterGui
- Script (server) → ServerScriptService with proper service references
- LocalScript (client) → StarterPlayer.StarterPlayerScripts with character handling
- ModuleScript → ReplicatedStorage for shared code and configuration
- Part, Model, MeshPart, UnionOperation → Workspace with proper anchoring
- ParticleEmitter, Beam, Trail, Attachment → Workspace (attached to Parts)
- Animation → StarterPlayer.StarterCharacterScripts with Humanoid loading
- Light, Atmosphere → Lighting service with environment consideration
- Sound → Workspace or appropriate parent with volume control
- Tool, HopperBin → StarterPack for player equipment

The system intelligently places assets based on ClassName, name context, and functional requirements.
`;
