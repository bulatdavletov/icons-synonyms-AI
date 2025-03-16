# Icon Synonyms AI Plugin - Development Plan

## Project Overview
A Figma plugin that uses AI to generate relevant synonyms for icon components and automatically adds them to component descriptions, improving searchability and usability of icon libraries.

The plugin leverages AI technology to:
- Generate contextually relevant synonyms for icons
- Enhance component searchability 
- Improve icon library usability

## Core Features
1. Description Management
   - Read existing component descriptions
   - Add new synonyms to descriptions
   - Handle both single components and component sets

2. Icon Export
   - Convert Figma icons to images
   - Handle different icon styles and formats
   - Optimize images for AI processing

3. AI Integration
   - Send icon data to AI provider
   - Process AI responses
   - Handle API errors

4. User Interface (Using @create-figma-plugin/ui)
   - Preview suggestions using Figma-like components
   - Edit suggestions with native-like UI elements
   - Progress indicators matching Figma's style
   - Custom prompt editor with consistent UI
   - Support for both light and dark themes

## Development Phases

### Phase 1: Description Management
- [x] Read description from component, component set, or instance
- [x] Edit description for a single component, component set

### Phase 2: AI Integration
- [x] Set up AI provider connection
- [x] Implement prompt template
- [x] Create response parsing
- [x] Add error handling
- [x] Add hardcoded API key for testing
- [x] Update to use current OpenAI models (gpt-4o)
- [x] Move API key to separate gitignored file
- [x] Move prompt to separate file
- [ ] Test with sample icons

### Phase 3: Icon Export
- [x] Implement icon-to-image conversion
- [x] Add support for various icon styles (filled, outlined, etc.)
- [x] Create image optimization pipeline
- [ ] Handle batch export for multiple icons
- [x] Add export error handling
- [ ] Test with different icon types and sizes

### Phase 4: User Interface
- [ ] Set up @create-figma-plugin/ui and Preact
- [x] Create suggestion preview interface with Figma-like components
- [x] Add inline editing capability with native-like inputs
- [ ] Implement batch selection interface
- [x] Add progress indicators
- [ ] Implement theme support (light/dark)

### Phase 5: Advanced Features
- [ ] Add custom prompt editor
- [ ] Implement batch processing


## File Structure
```
icons-synonyms-AI/
├── code.ts              # Main plugin logic
├── code.js              # Bundled JavaScript (from esbuild)
├── ui.html              # Plugin interface (HTML/CSS/JS)
├── manifest.json        # Plugin configuration
├── src/
│   ├── ai-service.ts    # AI API integration
│   ├── api-keys.ts      # API keys (gitignored)
│   ├── api-keys.template.ts # Template for API keys
│   ├── prompt-templates.ts  # Prompt template for AI
│   ├── icon-exporter.ts # Icon export functionality
│   ├── components/      # UI components
│   │   ├── Preview.tsx
│   │   ├── Editor.tsx
│   │   ├── BatchTable.tsx  # New component for batch processing
│   │   └── PromptEditor.tsx
│   └── utils.ts         # Helper functions
├── esbuild.config.js    # esbuild configuration
├── tsconfig.json        # TypeScript configuration
├── batch-processing-plan.md # Detailed plan for batch processing
└── package.json         # Project dependencies and scripts
```

## Build Process
1. TypeScript files are bundled using esbuild
2. The main entry point is `code.ts`, which gets bundled into `code.js`
3. The UI is defined in `ui.html`
4. Module imports are bundled into a single IIFE (Immediately Invoked Function Expression)
5. Build command: `npm run build`
6. Watch mode: `npm run watch`

## Component Description Format
```json
{
  "name": "icon-name",
  "synonyms": {
    "ai_generated": ["synonym1", "synonym2"],
    "user_edited": ["synonym3"],
    "original": ["existing1"]
  },
  "lastUpdated": "timestamp",
  "promptTemplate": "template_name"
}
```

## User Flow
1. User selects one or more components/component sets
2. Plugin reads existing descriptions
3. AI generates synonyms
4. User previews suggestions
5. User can edit suggestions inline
6. User applies approved changes
7. Changes are saved to component descriptions

## Next Steps
1. ✅ Set up project with Figma native UI components
2. ✅ Implement description reading/writing
3. ✅ Create basic AI integration
4. ✅ Build suggestion preview interface
5. ✅ Test multi-file structure and build process
6. ✅ Fix module bundling with esbuild
7. ✅ Implement hardcoded API key for testing
8. ✅ Update to use current OpenAI models
9. ✅ Move API key to separate gitignored file
10. ✅ Create detailed batch processing plan
11. ✅ Move prompt to separate file
12. [ ] Implement batch processing UI and functionality

## Technical Requirements
- Use native HTML/CSS/JS for consistent Figma-like interface
- Preserve existing component descriptions
- Support batch processing
- Handle API rate limits
- Maintain undo/redo history
- Support custom prompt templates
- Ensure proper theme handling (light/dark)

## Implementation Details

### Icon Export Format
- Using PNG format with base64 encoding for OpenAI Vision API
- Exporting at 2x scale for better quality
- Optimizing icon selection by preferring components over instances

### AI Integration
- Using OpenAI GPT-4o API for icon analysis (updated from gpt-4-vision-preview)
- Structured prompt in separate file for better organization
- JSON response format for easy parsing
- Error handling for API failures
- API key stored in separate gitignored file
- Template file provided for API key setup
- Local storage for API key persistence

### Multi-File Structure
- Main plugin code in `code.ts`
- UI in `ui.html`
- Modular code organization with separate files for different concerns
- TypeScript bundled into a single IIFE for Figma compatibility using esbuild

### Batch Processing
- Sequential processing of components one by one
- Table-based UI showing component name, status, and actions
- Progress tracking with visual indicators
- Ability to cancel processing
- Summary statistics after batch completion
- Maintain synonym grouping (Objects, Meanings, Shapes, Other)
- Individual component editing within batch interface
- Detailed implementation plan in batch-processing-plan.md

## Notes
- Always preview before applying changes
- Keep original descriptions intact
- Track AI-generated vs user-edited synonyms
- Consider caching for batch operations
- Support offline mode for saved suggestions 
- For Figma plugins, use bundlers like esbuild instead of plain TypeScript compilation
- API keys should be kept in gitignored files and not committed to the repository

## Recent fixes
- Improved AI response parsing to better handle line breaks and category detection
- Enhanced UI to display all synonym categories (Usage, Object, Modificator, Shapes)
- Fixed category name consistency across the codebase
- Added proper selection state handling for synonyms with category prefixes
- Updated synonym application to include category information
- Fixed component imports and type definitions in the UI code
- Improved error handling and loading states in the UI
- Added comprehensive debug logging for AI response parsing

## Current status
- Plugin can detect component selections correctly
- AI integration is working with the latest OpenAI model
- Debug logging is in place to help troubleshoot API interactions
- Basic UI functionality is implemented with structured categories:
  - Usage group (required) for action/feature terms
  - Object group (required) for main visual elements
  - Modificator group for corner icons/states
  - Shapes group for simple geometric elements
- Users can select multiple terms with visual feedback
- Selected terms can be applied in batch with the Apply Selected button
- Component descriptions preserve existing content when adding terms
- Description format follows Answer Structure exactly:
  - Usage: action/feature terms
  - Object: main visual elements
  - Modificator: corner icons/states
  - Shapes: simple geometric elements
- Empty descriptions are handled gracefully with visual indicators
- UI is streamlined with only essential elements for better user experience
- API key is securely stored in a gitignored config file
- Event handling is consistent and type-safe throughout the codebase
- Detailed batch processing plan created
- Prompt is organized in a separate file for better maintainability
- AI responses are properly parsed from text format
- Category grouping follows exact Answer Structure format

# UI Implementation Plan with @create-figma-plugin/ui

## Migration Steps

### 1. Setup (Day 1)
- [ ] Install required dependencies:
  ```bash
  npm install @create-figma-plugin/ui preact
  ```
- [ ] Update package.json with UI configuration:
  ```json
  {
    "figma-plugin": {
      "name": "Icon Synonyms AI",
      "id": "1481361200325156818",
      "main": "src/main.ts",
      "ui": "src/ui.tsx"
    }
  }
  ```
- [ ] Update tsconfig.json to support JSX:
  ```json
  {
    "compilerOptions": {
      "jsx": "react",
      "jsxFactory": "h"
    }
  }
  ```

### 2. File Structure Update (Day 1)
- [ ] Create new UI entry point: src/ui.tsx
- [ ] Move existing UI logic from ui.html to React components
- [ ] Create component directory structure:
  ```
  src/
  ├── components/
  │   ├── App.tsx              # Main UI container
  │   ├── SynonymGroup.tsx     # Group component for synonyms
  │   ├── SynonymTag.tsx       # Individual synonym tag
  │   ├── ComponentInfo.tsx    # Component information display
  │   └── ActionButtons.tsx    # Generate/Apply buttons
  ```

### 3. Component Implementation (Days 2-3)
- [ ] Implement base components using @create-figma-plugin/ui:
  - [ ] Container and layout components
  - [ ] Button components for actions
  - [ ] Text components for descriptions
  - [ ] Loading indicators
- [ ] Implement custom components:
  - [ ] SynonymGroup with selection functionality
  - [ ] ComponentInfo with description display
  - [ ] ActionButtons with proper event handling

### 4. State Management (Day 4)
- [ ] Set up message passing between UI and plugin:
  ```typescript
  // In main.ts
  figma.showUI(__html__, { width: 400, height: 500 });
  
  // In ui.tsx
  import { emit } from '@create-figma-plugin/utilities';
  emit('GENERATE_SYNONYMS', data);
  ```
- [ ] Implement state management for:
  - [ ] Selected component info
  - [ ] Generated synonyms
  - [ ] Selection state
  - [ ] Loading states

### 5. Theme Support (Day 4)
- [ ] Implement automatic theme detection
- [ ] Test UI in both light and dark modes
- [ ] Ensure consistent styling across themes

### 6. Testing & Refinement (Day 5)
- [ ] Test all UI interactions
- [ ] Verify theme switching
- [ ] Test performance with large synonym sets
- [ ] Polish animations and transitions
- [ ] Add error handling UI

## Component Specifications

### App.tsx
```typescript
import { render, Container } from '@create-figma-plugin/ui'
import { h } from 'preact'

function Plugin() {
  return (
    <Container space="medium">
      <ComponentInfo />
      <SynonymGroups />
      <ActionButtons />
    </Container>
  )
}

export default render(Plugin)
```

### SynonymGroup.tsx
```typescript
interface Props {
  title: string
  synonyms: string[]
  onSelect: (synonym: string) => void
}
```

### ComponentInfo.tsx
```typescript
interface Props {
  name: string
  type: string
  description: string
  hasDescription: boolean
}
```

## Message Types
```typescript
type Message = 
  | { type: 'GENERATE_SYNONYMS' }
  | { type: 'UPDATE_DESCRIPTION', description: string }
  | { type: 'SELECTION_CHANGE', selection: ComponentInfo }
```

## Next Steps
1. [ ] Set up development environment with new dependencies
2. [ ] Create basic component structure
3. [ ] Migrate existing UI logic to new components
4. [ ] Implement theme support
5. [ ] Test and refine

## Notes
- Keep existing functionality while migrating
- Maintain current synonym grouping (Objects, Meanings, Shapes, Other)
- Ensure smooth transitions between states
- Follow Figma's UI patterns and guidelines

## Completed Tasks
1. Set up project structure with necessary files
2. Implemented base UI components using @create-figma-plugin/ui
3. Added state management using Preact hooks
4. Created message handling between UI and plugin code
5. Set up CSS styling with Figma's theme variables
6. Fixed build configuration:
   - Configured build-figma-plugin correctly
   - Set up proper TypeScript configuration
   - Fixed manifest.json and package.json alignment
   - Successfully built and loaded the plugin in Figma

## Next Steps
1. Add missing functionality from old UI:
   - Loading states
   - Error handling
   - Synonym grouping by category
2. Polish UI and interactions:
   - Add animations
   - Improve error messages
   - Add loading indicators
3. Add documentation:
   - Update README
   - Add comments to code
   - Document event handling pattern

## Future Improvements
1. Add unit tests
2. Implement caching for generated synonyms
3. Add support for batch processing multiple icons
4. Improve AI service with more context
5. Add user preferences for synonym categories