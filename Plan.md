# Icon Synonyms AI Plugin - Development Plan

## Project Overview
A Figma plugin that uses AI to generate relevant synonyms for icon components and automatically adds them to component descriptions, improving searchability and usability of icon libraries. The plugin uses Figma's native UI components and allows users to preview and edit suggestions before applying them.

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
11. [ ] Implement batch processing UI and functionality
12. Fix: Incorrect API key provided: sk-proj-********************************************************************************************************************************************************8c0A. You can find your API key at https://platform.openai.com/account/api-keys.

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
- Structured prompt template focusing on visual appearance and use cases
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
- Updated the AI model from deprecated `gpt-4-vision-preview` to current `gpt-4o`
- Added console logging to display the final message sent to OpenAI API and the response received
- Fixed localStorage access issues with try-catch blocks
- Improved selection handling with centralized `sendSelectionToUI()` function
- Added UI ready message to ensure proper initialization
- Simplified UI to focus only on Generate Synonyms functionality
- Organized generated synonyms into meaningful groups (Objects, Meanings, Shapes, Other)
- Added ability to select specific synonyms and apply them to component descriptions
- Implemented "Synonyms: x, y, z" format for adding synonyms to descriptions
- Improved handling of empty descriptions with better visual indicators
- Removed API key input field and related UI elements for a cleaner interface
- Moved API key to separate gitignored file for better security
- Created API key template file for easier setup

## Current status
- Plugin can detect component selections correctly
- AI integration is working with the latest OpenAI model
- Debug logging is in place to help troubleshoot API interactions
- Basic UI functionality is implemented with grouped synonyms for better organization
- Users can now select specific synonyms and apply them to component descriptions
- Empty descriptions are handled gracefully with visual indicators
- UI is streamlined with only essential elements for better user experience
- API key is securely stored in a separate gitignored file
- Detailed batch processing plan created
- Next focus areas: implementing batch processing UI and functionality