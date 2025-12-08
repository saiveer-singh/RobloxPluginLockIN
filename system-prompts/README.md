# System Prompts

This directory contains all system prompt modules that are used by the RobloxGen AI system. Each module exports a TypeScript string constant containing a complete system prompt that specializes in different types of Roblox development tasks.

## Files

### Core Prompts
- `base-schema.ts` - Base schema with JSON formatting rules and property guidelines
- `scripting-prompt.ts` - Expert scripting prompt for Luau programming, game systems, and advanced architecture
- `vfx-prompt.ts` - Visual effects prompt specializing in particle systems, animations, and rendering optimization
- `animation-prompt.ts` - Animation prompt for character animations, movement systems, and procedural animation
- `modeling-prompt.ts` - Modeling prompt for 3D builds, part manipulation, and architectural design
- `index.ts` - Barrel export file for all prompts

## Usage

To import and use a system prompt module:

```typescript
import { SCRIPTING_PROMPT } from './system-prompts';

// Use the prompt string directly
const promptText = SCRIPTING_PROMPT;
```

Or import multiple prompts:

```typescript
import {
  SCRIPTING_PROMPT,
  VFX_PROMPT,
  MODELING_PROMPT
} from './system-prompts';
```

Each module exports a string constant containing the complete system prompt with specific expertise areas for that domain.

## Prompt Specializations

### Scripting Prompt
- Enterprise-level Luau architecture
- Anti-exploit security systems
- High-performance optimization
- Advanced data persistence patterns
- Event-driven architecture
- Production debugging and monitoring

### VFX Prompt
- Advanced particle physics simulation
- Real-time rendering optimization
- Color theory and visual psychology
- Performance-optimized effects (60+ FPS target)
- Complex effect layering and compositing
- Physics-based particle systems

### Animation Prompt
- Roblox Animation API mastery
- Humanoid animation systems
- Character movement and pose manipulation
- Animation blending and transitions
- Procedural animation scripts
- Player and NPC animation control

### Modeling Prompt
- Advanced part manipulation
- MeshPart and custom geometry
- Material and texture optimization
- Efficient model organization
- Architectural design principles
- Complex shape creation with UnionOperation

## Integration

These prompts are automatically selected in the `ai.ts` file based on request type detection, which analyzes the user's prompt to determine the most appropriate expertise domain before generating content.

The base schema provides the core JSON formatting rules that all prompts share, ensuring consistent output format across all generation types.
