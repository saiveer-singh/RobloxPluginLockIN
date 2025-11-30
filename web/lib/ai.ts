import fs from 'fs';
import path from 'path';

function getApiKeys(): Record<string, string | undefined> {
  let keys: Record<string, string | undefined> = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    OPENCODE_API_KEY: process.env.OPENCODE_API_KEY,
  };

  try {
    // Always try reading file in Node environment to supplement env vars
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        const keysPath = path.join(process.cwd(), 'api-keys.json');
        if (fs.existsSync(keysPath)) {
          const file = fs.readFileSync(keysPath, 'utf8');
          try {
            const fileKeys = JSON.parse(file);
            // Merge keys, letting environment variables take precedence if they exist and are not empty
            keys = {
              OPENAI_API_KEY: keys.OPENAI_API_KEY || fileKeys.OPENAI_API_KEY,
              OPENROUTER_API_KEY: keys.OPENROUTER_API_KEY || fileKeys.OPENROUTER_API_KEY,
              GEMINI_API_KEY: keys.GEMINI_API_KEY || fileKeys.GEMINI_API_KEY,
              OPENCODE_API_KEY: keys.OPENCODE_API_KEY || fileKeys.OPENCODE_API_KEY,
              ...fileKeys // Include any other keys from file
            };
          } catch (e) {
            console.error('Failed to parse api-keys.json:', e);
          }
        }
    }
  } catch (e) {
    console.warn('Error loading api-keys.json:', e);
  }
  return keys;
}

const PLANNING_PROMPT = `
You are a Technical Architect for Roblox game development. Your goal is to analyze the user's request and create a detailed, step-by-step execution plan.

CRITICAL: Output MUST be strict JSON matching this exact schema:
{
  "plan": [
    "Step 1: Description of first action",
    "Step 2: Description of second action",
    ...
  ],
  "message": "A brief summary of the proposed plan."
}

DO NOT generate code, assets, or scripts yet. Focus ONLY on the plan.
Break down complex tasks into logical, manageable steps that a developer would follow.
Consider:
- Architecture and file structure
- Dependencies between components
- Configuration and properties
`;

const BASE_SCHEMA = `
CRITICAL: Output MUST be strict JSON matching this exact schema (no markdown, no code blocks, pure JSON only):
{
  "reasoning": "High-level thought process...",
  "plan": [
    "Step 1: Detailed description of task...",
    "Step 2: ...",
    ...
  ],
  "message": "Concise description of what was created...",
  "assets": [
    {
      "ClassName": "String",
      "Properties": { "PropertyName": "Value" },
      "Children": [ ... ]
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

const SCRIPTING_PROMPT = `
You are an advanced Roblox AI system with deep expertise in Luau programming, game architecture, and production-ready development. You analyze requirements comprehensively and create sophisticated, optimized solutions.

${BASE_SCHEMA}

ADVANCED EXPERTISE AREAS:
- Enterprise-level Luau architecture with design patterns and best practices
- Complete Roblox API mastery including all services, events, and advanced features
- Client-server security architecture with anti-exploit and validation systems
- High-performance optimization (memory management, efficient algorithms, pooling)
- Advanced data persistence with reliable DataStore patterns and error recovery
- Event-driven architecture with proper cleanup and memory leak prevention
- Modern UI frameworks (Roact, Fusion) with responsive design principles
- Advanced physics simulation, raycasting, and spatial optimization
- Sophisticated networking with data synchronization and conflict resolution
- Production debugging, logging, and monitoring systems

PLANNING REQUIREMENT: You MUST provide a detailed, step-by-step implementation plan in the "plan" array. This helps the user understand your approach.

COMPREHENSIVE REQUIREMENTS:
1. ARCHITECTURE: Design modular, scalable systems with clear separation of concerns
2. SECURITY: Implement server-side validation, input sanitization, and anti-exploit measures
3. PERFORMANCE: Use efficient algorithms, object pooling, and memory optimization
4. RELIABILITY: Add comprehensive error handling, retry logic, and graceful degradation
5. MAINTAINABILITY: Follow Roblox conventions, add documentation, and use clear naming
6. EXTENSIBILITY: Design for future enhancements with configuration systems and hooks
7. TESTING: Include validation logic and debugging capabilities
8. USER EXPERIENCE: Add loading states, feedback, and smooth interactions

PRODUCTION PATTERNS:
- Service-oriented architecture with dependency injection
- Event-driven communication with proper decoupling
- State management with immutable data patterns
- Configuration-driven systems for easy tweaking
- Rate limiting and throttling for performance
- Comprehensive logging and error tracking
- Memory-efficient data structures and algorithms
- Proper cleanup and resource management

ADVANCED FEATURES:
- Real-time data synchronization with conflict resolution
- Sophisticated caching strategies and invalidation
- Advanced player session management
- Dynamic content loading and streaming
- Performance monitoring and analytics
- Automated testing and validation systems
- Cross-platform compatibility considerations
- Accessibility and localization support

REASONING REQUIREMENTS:
Your reasoning must include:
1. Requirements analysis and stakeholder considerations
2. Technical architecture decisions with trade-offs
3. Security implications and mitigation strategies
4. Performance bottlenecks and optimization approaches
5. Scalability concerns and future-proofing measures
6. User experience design and interaction flows
7. Maintenance and operational considerations
8. Risk assessment and contingency planning

CRITICAL: Deliver complete, production-ready systems with enterprise-grade quality, comprehensive documentation, and advanced features. Never compromise on security, performance, or maintainability.
`;

const VFX_PROMPT = `
You are an advanced visual effects AI system with expertise in particle physics, computer graphics, and real-time rendering optimization. You create cinematic, performance-optimized visual effects that enhance user experience while maintaining high frame rates.

${BASE_SCHEMA}

MASTER-LEVEL EXPERTISE:
- Advanced particle physics simulation and behavioral modeling
- Real-time rendering optimization with GPU considerations
- Color theory, visual psychology, and cinematic composition
- Multi-platform performance optimization (mobile, desktop, console)
- Complex effect layering and compositing techniques
- Physics-based particle systems with force fields and collisions
- Procedural generation and dynamic effect modification algorithms
- Advanced texture optimization and memory management
- Audio-visual synchronization and multi-sensory integration
- Sophisticated LOD (Level of Detail) and culling systems

PRODUCTION VFX STANDARDS:
1. PERFORMANCE: Target 60+ FPS on all devices with intelligent optimization
2. VISUAL QUALITY: Create stunning, cinematic effects with proper composition
3. SCALABILITY: Implement dynamic quality adjustment based on device capabilities
4. MEMORY EFFICIENCY: Use texture atlases, object pooling, and smart cleanup
5. PHYSICS REALISM: Apply accurate physics simulation with proper forces and constraints
6. ARTISTIC COHESION: Maintain consistent visual style and color theory
7. INTERACTIVITY: Design effects that respond to user actions and environment
8. ACCESSIBILITY: Ensure effects work for users with different hardware capabilities

ADVANCED TECHNICAL REQUIREMENTS:
- Attachment-based particle systems with proper spatial relationships
- Complex ColorSequence and NumberSequence configurations for natural motion
- Dynamic property modification with smooth interpolation
- Multi-emitter coordination for complex effect compositions
- Environmental interaction (wind, gravity, collisions, lighting)
- Camera-relative billboarding and orientation optimization
- Distance-based culling and quality scaling
- Texture optimization with compression and mipmapping considerations
- Sound integration with spatial audio positioning
- Performance profiling and real-time optimization

SOPHISTICATED EFFECT CATEGORIES:
- ENERGY SYSTEMS: Plasma, electricity, force fields, quantum effects, magical auras
- NATURAL PHENOMENA: Fire, water, smoke, weather, geological effects, organic growth
- TECHNOLOGICAL EFFECTS: Holograms, circuits, machinery, digital interfaces, cyber effects
- FANTASY ELEMENTS: Magic spells, portals, summoning rituals, enchantments, divine effects
- COMBAT SYSTEMS: Explosions, impacts, weapon trails, status effects, damage visualization
- ENVIRONMENTAL EFFECTS: Atmospheric scattering, lighting systems, weather dynamics

REASONING REQUIREMENTS:
Your reasoning must include:
1. Visual design analysis and artistic direction choices
2. Performance implications and optimization strategies
3. Physics simulation requirements and behavioral modeling
4. Technical architecture decisions and component relationships
5. User experience considerations and accessibility factors
6. Platform-specific optimizations and compatibility measures
7. Memory management and resource allocation strategies
8. Future extensibility and dynamic modification capabilities

CRITICAL: Create visually stunning, performance-optimized effects with cinematic quality, intelligent scaling, and comprehensive technical excellence. Every effect must enhance user experience while maintaining optimal performance.
`;

const ANIMATION_PROMPT = `
You are a Roblox animation expert specializing in character animations, movement systems, and procedural animation.

${BASE_SCHEMA}

YOUR EXPERTISE:
- Animation objects and AnimationTracks
- Humanoid animation loading and playback
- Character movement and pose manipulation
- Animation blending and transitions
- NPC animation systems
- Procedural animation scripts

ANIMATION CREATION RULES:
1. Animation objects go in StarterPlayer.StarterCharacterScripts
2. Animation scripts (LocalScripts) go in StarterPlayer.StarterPlayerScripts
3. Use Humanoid:LoadAnimation() to load animations
4. Set Looped property for continuous animations
5. Use Priority for animation importance (Enum.AnimationPriority)
6. Handle character loading with CharacterAdded event
7. Use proper AnimationId format: "rbxassetid://[ID]"
8. For NPCs, create scripts that automatically play animations
9. Consider using AnimationController for advanced control
10. Handle animation cleanup on character removal

ANIMATION TYPES:
- Movement: Walk, Run, Jump, Fall
- Idle: Standing, sitting, thinking
- Actions: Wave, point, dance, cheer
- Combat: Attack, block, dodge
- Emotes: Various character expressions

EXAMPLE - Walking Animation System:
{
  "reasoning": "Creating a walking animation system requires: 1) An Animation object with a walking animation ID, 2) A LocalScript that waits for the character to load, gets the Humanoid, loads the animation, and plays it in a loop. I'll handle proper character loading and cleanup.",
  "message": "Created walking animation system",
  "assets": [
    {
      "ClassName": "Animation",
      "Properties": {
        "Name": "WalkAnimation",
        "AnimationId": "rbxassetid://507766388"
      },
      "Children": []
    },
    {
      "ClassName": "LocalScript",
      "Properties": {
        "Name": "PlayWalkAnimation",
        "Source": "local Players = game:GetService(\"Players\")\nlocal player = Players.LocalPlayer\n\nlocal function setupAnimation(character)\n\tlocal humanoid = character:WaitForChild(\"Humanoid\")\n\tlocal walkAnim = script.Parent:WaitForChild(\"WalkAnimation\")\n\t\n\tlocal animationTrack = humanoid:LoadAnimation(walkAnim)\n\tanimationTrack.Looped = true\n\tanimationTrack.Priority = Enum.AnimationPriority.Movement\n\t\n\t-- Play when moving\n\thumanoid.Running:Connect(function(speed)\n\t\tif speed > 0 then\n\t\t\tif not animationTrack.IsPlaying then\n\t\t\t\tanimationTrack:Play()\n\t\t\tend\n\t\telse\n\t\t\tif animationTrack.IsPlaying then\n\t\t\t\tanimationTrack:Stop()\n\t\t\tend\n\t\tend\n\tend)\nend\n\nif player.Character then\n\tsetupAnimation(player.Character)\nend\n\nplayer.CharacterAdded:Connect(setupAnimation)"
      },
      "Children": []
    }
  ]
}

CRITICAL: Always create complete animation systems with proper character handling.
`;

const MODELING_PROMPT = `
You are a master Roblox builder and 3D modeler specializing in creating detailed, well-structured models and builds.

${BASE_SCHEMA}

YOUR EXPERTISE:
- Advanced Part manipulation (Size, Position, Rotation, CFrame)
- MeshPart and custom meshes
- UnionOperation for complex shapes
- Material properties and textures
- Efficient model structure and organization
- Scale and proportion mastery
- Architectural and design principles

MODELING REQUIREMENTS:
1. ALWAYS wrap multiple parts in a Model container
2. Use descriptive names (e.g., "HouseModel", "DoorPart", "WindowFrame")
3. Set Anchored = "true" for static structures
4. Use proper Size values (consider scale - 1 stud = 1 foot)
5. Position parts relative to each other using CFrame or Position
6. Use appropriate Materials (Brick, Metal, Wood, Neon, Glass, etc.)
7. Set CanCollide appropriately (false for decorative parts)
8. Use Color3 for material colors
9. Group related parts logically
10. Consider using SpecialMesh for custom shapes
11. Use MeshPart for complex geometry (provide MeshId)
12. Use UnionOperation to combine parts efficiently

MODEL TYPES:
- Buildings: Houses, shops, towers, structures
- Vehicles: Cars, planes, boats
- Furniture: Chairs, tables, decorations
- Weapons: Swords, guns, tools
- Props: Items, objects, decorations
- Environments: Terrain, landscapes, obstacles

EXAMPLE - Modern House:
{
  "reasoning": "Creating a modern house requires: 1) A Model container as root, 2) Four wall Parts with proper size and positioning, 3) A roof Part angled or flat, 4) Door and window Parts with appropriate materials, 5) Proper anchoring and collision settings. I'll use Brick material for walls, Metal for roof, and Wood for door.",
  "message": "Created modern house model with windows and door",
  "assets": [
    {
      "ClassName": "Model",
      "Properties": {
        "Name": "ModernHouse"
      },
      "Children": [
        {
          "ClassName": "Part",
          "Properties": {
            "Name": "WallFront",
            "Size": "20,12,1",
            "Position": "0,6,10",
            "Anchored": "true",
            "Material": "Enum.Material.Brick",
            "Color": "200,200,200",
            "CanCollide": "true"
          },
          "Children": []
        },
        {
          "ClassName": "Part",
          "Properties": {
            "Name": "Roof",
            "Size": "22,1,22",
            "Position": "0,12.5,0",
            "Anchored": "true",
            "Material": "Enum.Material.Metal",
            "Color": "139,69,19",
            "CanCollide": "true"
          },
          "Children": []
        },
        {
          "ClassName": "Part",
          "Properties": {
            "Name": "Door",
            "Size": "3,6,0.5",
            "Position": "0,3,10.5",
            "Anchored": "true",
            "Material": "Enum.Material.Wood",
            "Color": "101,67,33",
            "CanCollide": "true"
          },
          "Children": []
        }
      ]
    }
  ]
}

CRITICAL: Always create complete, well-structured models with proper hierarchy and materials.
`;

// Enhanced request type detection with context awareness and scoring
export function detectRequestType(prompt: string): 'scripting' | 'vfx' | 'animation' | 'modeling' {
  const lowerPrompt = prompt.toLowerCase();
  
  // Enhanced keyword sets with weights and context
  const keywordSets = {
    vfx: {
      keywords: [
        { word: 'vfx', weight: 3 },
        { word: 'particle', weight: 2 },
        { word: 'effect', weight: 1 },
        { word: 'spark', weight: 2 },
        { word: 'smoke', weight: 2 },
        { word: 'fire', weight: 2 },
        { word: 'explosion', weight: 3 },
        { word: 'beam', weight: 2 },
        { word: 'trail', weight: 2 },
        { word: 'lightning', weight: 3 },
        { word: 'magic', weight: 2 },
        { word: 'glow', weight: 2 },
        { word: 'emitter', weight: 3 },
        { word: 'visual effect', weight: 2 },
        { word: 'particle effect', weight: 2 },
        { word: 'smoke effect', weight: 2 },
        { word: 'fire effect', weight: 2 },
        { word: 'laser', weight: 2 },
        { word: 'energy', weight: 2 },
        { word: 'aura', weight: 2 },
        { word: 'shockwave', weight: 3 },
        { word: 'flash', weight: 1 },
        { word: 'burst', weight: 2 },
        { word: 'poof', weight: 1 },
        { word: 'sparkle', weight: 2 },
        { word: 'shimmer', weight: 2 }
      ],
      context: ['visual', 'appearance', 'effect', 'particle', 'emission']
    },
    animation: {
      keywords: [
        { word: 'animate', weight: 3 },
        { word: 'animation', weight: 3 },
        { word: 'walk', weight: 2 },
        { word: 'run', weight: 2 },
        { word: 'jump', weight: 2 },
        { word: 'wave', weight: 2 },
        { word: 'dance', weight: 2 },
        { word: 'idle', weight: 2 },
        { word: 'keyframe', weight: 3 },
        { word: 'pose', weight: 2 },
        { word: 'movement', weight: 1 },
        { word: 'gesture', weight: 2 },
        { word: 'emote', weight: 2 },
        { word: 'character animation', weight: 3 },
        { word: 'animating', weight: 3 },
        { word: 'animated', weight: 2 },
        { word: 'tween', weight: 2 },
        { word: 'transition', weight: 1 }
      ],
      context: ['character', 'movement', 'motion', 'time-based', 'sequential']
    },
    scripting: {
      keywords: [
        { word: 'script', weight: 3 },
        { word: 'code', weight: 2 },
        { word: 'system', weight: 2 },
        { word: 'function', weight: 3 },
        { word: 'pet system', weight: 3 },
        { word: 'shop system', weight: 3 },
        { word: 'obby', weight: 2 },
        { word: 'mechanic', weight: 2 },
        { word: 'gameplay', weight: 2 },
        { word: 'lua', weight: 3 },
        { word: 'luau', weight: 3 },
        { word: 'program', weight: 2 },
        { word: 'logic', weight: 2 },
        { word: 'ai', weight: 2 },
        { word: 'npc behavior', weight: 3 },
        { word: 'dialogue', weight: 2 },
        { word: 'inventory', weight: 2 },
        { word: 'leaderboard', weight: 2 },
        { word: 'data', weight: 1 },
        { word: 'save', weight: 1 },
        { word: 'load', weight: 1 },
        { word: 'datastore', weight: 3 },
        { word: 'remoteevent', weight: 3 },
        { word: 'remotefunction', weight: 3 },
        { word: 'bindable', weight: 2 },
        { word: 'service', weight: 2 },
        { word: 'api', weight: 2 }
      ],
      context: ['logic', 'functionality', 'behavior', 'interaction', 'system']
    },
    modeling: {
      keywords: [
        { word: 'model', weight: 3 },
        { word: 'build', weight: 2 },
        { word: 'house', weight: 2 },
        { word: 'building', weight: 2 },
        { word: 'structure', weight: 2 },
        { word: 'part', weight: 2 },
        { word: 'mesh', weight: 2 },
        { word: 'union', weight: 2 },
        { word: 'shape', weight: 1 },
        { word: 'geometry', weight: 2 },
        { word: 'create', weight: 1 },
        { word: 'make', weight: 1 },
        { word: 'design', weight: 1 },
        { word: 'architect', weight: 2 },
        { word: 'furniture', weight: 2 },
        { word: 'vehicle', weight: 2 },
        { word: 'weapon', weight: 2 },
        { word: 'tool', weight: 2 },
        { word: 'object', weight: 1 },
        { word: 'item', weight: 1 },
        { word: 'prop', weight: 1 },
        { word: 'terrain', weight: 2 },
        { word: 'landscape', weight: 2 },
        { word: 'obstacle', weight: 1 }
      ],
      context: ['physical', 'structure', 'geometry', 'appearance', 'static']
    }
  };
  
  // Calculate weighted scores for each type
  const scores: Record<string, number> = {
    vfx: 0,
    animation: 0,
    scripting: 0,
    modeling: 0
  };
  
  // Score based on keyword matches
  for (const [type, data] of Object.entries(keywordSets)) {
    for (const { word, weight } of data.keywords) {
      if (lowerPrompt.includes(word)) {
        scores[type] += weight;
      }
    }
  }
  
  // Bonus points for context matches
  for (const [type, data] of Object.entries(keywordSets)) {
    for (const contextWord of data.context) {
      if (lowerPrompt.includes(contextWord)) {
        scores[type] += 0.5;
      }
    }
  }
  
  // Find the best match
  const maxScore = Math.max(...Object.values(scores));
  
  // If all scores are 0, use intelligent default based on prompt analysis
  if (maxScore === 0) {
    // Check for action verbs vs creation verbs
    const actionVerbs = ['make', 'create', 'build', 'generate'];
    const hasActionVerb = actionVerbs.some(verb => lowerPrompt.includes(verb));
    
    if (hasActionVerb) {
      // Default to modeling for general creation requests
      return 'modeling';
    }
    
    // Check for technical vs descriptive language
    const technicalWords = ['system', 'function', 'code', 'script', 'logic'];
    const descriptiveWords = ['look', 'appear', 'visual', 'effect', 'style'];
    
    const technicalCount = technicalWords.filter(word => lowerPrompt.includes(word)).length;
    const descriptiveCount = descriptiveWords.filter(word => lowerPrompt.includes(word)).length;
    
    if (technicalCount > descriptiveCount) {
      return 'scripting';
    } else if (descriptiveCount > 0) {
      return 'vfx';
    }
    
    return 'modeling';
  }
  
  // Return the type with the highest score
  const bestType = Object.entries(scores).reduce((best, [type, score]) => 
    score > scores[best] ? type : best
  , 'modeling');
  
  return bestType as 'scripting' | 'vfx' | 'animation' | 'modeling';
}

export type ModelProvider =
  | 'x-ai-grok-4.1-fast-free'
  | 'z-ai-glm-4.5-air-free'
  | 'moonshotai-kimi-k2-free'
  | 'qwen-qwen3-coder-free'
  | 'gpt-5-nano'
  | 'grok-code'
  | 'big-pickle';

export interface ModelConfig {
  provider: string;
  modelId: string;
  displayName: string;
}

export const MODEL_CONFIGS: Record<ModelProvider, ModelConfig> = {
  'x-ai-grok-4.1-fast-free': {
    provider: 'openrouter',
    modelId: 'x-ai/grok-4.1-fast:free',
    displayName: 'Grok 4.1 Fast Free'
  },
  'z-ai-glm-4.5-air-free': {
    provider: 'openrouter',
    modelId: 'z-ai/glm-4.5-air:free',
    displayName: 'GLM 4.5 Air Free'
  },
  'moonshotai-kimi-k2-free': {
    provider: 'openrouter',
    modelId: 'moonshotai/kimi-k2:free',
    displayName: 'Kimi K2 Free'
  },
  'qwen-qwen3-coder-free': {
    provider: 'openrouter',
    modelId: 'qwen/qwen3-coder:free',
    displayName: 'Qwen 3 Coder Free'
  },
  'gpt-5-nano': {
    provider: 'opencode',
    modelId: 'gpt-5-nano',
    displayName: 'GPT 5 Nano'
  },
  'grok-code': {
    provider: 'opencode',
    modelId: 'grok-code',
    displayName: 'Grok Code Fast 1'
  },
  'big-pickle': {
    provider: 'opencode',
    modelId: 'big-pickle',
    displayName: 'Big Pickle'
  }
};

export interface GenerationResult {
  content: unknown;
  model: string;
  tokensUsed: number;
  tokensPerSecond: number;
  duration: number;
  requestType: string;
}

/**
 * Cleans the AI response to extract valid JSON.
 * Removes markdown code blocks and finds the substring between the first '{' and last '}'.
 */
export function cleanJson(text: string): string {
  if (!text) return text;

  // Remove markdown code blocks (```json ... ``` or just ``` ... ```)
  // We use a simple replacement for common patterns
  let cleaned = text;

  // Remove ```json and ```
  // Using simple replaceAll if available or global regex
  cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '');

  // Find the first '{' and last '}'
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');

  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }

  return cleaned.trim();
}

export async function generateContent(prompt: string, model: string, systemPrompt?: string): Promise<GenerationResult> {
  const startTime = Date.now();

  const requestType = detectRequestType(prompt);

  let fullSystemPrompt = '';
  switch (requestType) {
    case 'scripting':
      fullSystemPrompt = SCRIPTING_PROMPT;
      break;
    case 'vfx':
      fullSystemPrompt = VFX_PROMPT;
      break;
    case 'animation':
      fullSystemPrompt = ANIMATION_PROMPT;
      break;
    case 'modeling':
      fullSystemPrompt = MODELING_PROMPT;
      break;
  }

  if (systemPrompt) {
    fullSystemPrompt += '\n\n' + systemPrompt;
  }

  const config = MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS];
  if (!config) {
    throw new Error(`Unsupported model: ${model}`);
  }

  const currentApiKeys = getApiKeys();
  let apiKey: string | undefined;
  let endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  if (config.provider === 'openrouter') {
    apiKey = currentApiKeys.OPENROUTER_API_KEY;
  } else if (config.provider === 'opencode') {
    apiKey = currentApiKeys.OPENCODE_API_KEY;
    endpoint = 'https://opencode.ai/zen/v1/chat/completions';
  } else {
    apiKey = currentApiKeys.OPENAI_API_KEY;
  }

  if (!apiKey) {
    throw new Error(`API key not found for provider: ${config.provider}. Please check api-keys.json.`);
  }

  console.log('Making API request to', config.provider, 'with model:', config.modelId);

  const fetchPromise = fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://opencode.ai',
      'X-Title': 'Roblox Plugin',
    },
    body: JSON.stringify({
      model: config.modelId,
      messages: [
        {
          role: 'system',
          content: fullSystemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    })
  });

  // Increased timeout to 60 seconds for complex generations
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out after 60 seconds')), 60000)
  );

  const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

  if (!response.ok) {
    let errorText = await response.text();
    try {
      const json = JSON.parse(errorText);
      if (json.error && json.error.message) {
        errorText = json.error.message;
      } else if (json.error) {
        errorText = typeof json.error === 'string' ? json.error : JSON.stringify(json.error);
      }
    } catch {
      // Use raw text if JSON parse fails
    }
    throw new Error(`OpenRouter API Error: ${errorText} (Status: ${response.status})`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('No content returned from AI');
  }

  let content;
  try {
    const cleanedContent = cleanJson(rawContent);
    content = JSON.parse(cleanedContent);
  } catch (e) {
    console.error('Failed to parse AI response:', e);
    console.error('Raw content:', rawContent);
    console.error('Cleaned content:', cleanJson(rawContent));
    throw new Error(`Failed to parse AI response. The model generated invalid JSON: ${(e as Error).message}`);
  }

  const duration = (Date.now() - startTime) / 1000;
  const tokensUsed = data.usage?.total_tokens || 0;
  const tokensPerSecond = tokensUsed / duration;

  return {
    content,
    model,
    tokensUsed,
    tokensPerSecond,
    duration,
    requestType,
  };
}

export async function generateContentStream(
  prompt: string,
  model: string,
  systemPrompt?: string,
  mode: 'planning' | 'execution' = 'execution'
): Promise<{ stream: ReadableStream<Uint8Array>; requestType: string; provider: string; modelId: string }> {
  const requestType = detectRequestType(prompt);

  let fullSystemPrompt = '';
  
  if (mode === 'planning') {
    fullSystemPrompt = PLANNING_PROMPT;
  } else {
    switch (requestType) {
      case 'scripting':
        fullSystemPrompt = SCRIPTING_PROMPT;
        break;
      case 'vfx':
        fullSystemPrompt = VFX_PROMPT;
        break;
      case 'animation':
        fullSystemPrompt = ANIMATION_PROMPT;
        break;
      case 'modeling':
        fullSystemPrompt = MODELING_PROMPT;
        break;
    }
  }

  if (systemPrompt) {
    fullSystemPrompt += '\n\n' + systemPrompt;
  }

  const config = MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS];
  if (!config) {
    throw new Error(`Unsupported model: ${model}`);
  }

  const currentApiKeys = getApiKeys();
  let apiKey: string | undefined;
  let endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  if (config.provider === 'openrouter') {
    apiKey = currentApiKeys.OPENROUTER_API_KEY;
  } else if (config.provider === 'opencode') {
    apiKey = currentApiKeys.OPENCODE_API_KEY;
    endpoint = 'https://opencode.ai/zen/v1/chat/completions';
  } else {
    apiKey = currentApiKeys.OPENAI_API_KEY;
  }

  if (!apiKey) {
    throw new Error(`API key not found for provider: ${config.provider}`);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://opencode.ai',
      'X-Title': 'Roblox Plugin',
    },
    body: JSON.stringify({
      model: config.modelId,
      messages: [
        { role: 'system', content: fullSystemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API Error: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('No response body from OpenRouter');
  }

  return { 
    stream: response.body, 
    requestType,
    provider: config.provider,
    modelId: config.modelId
  };
}
