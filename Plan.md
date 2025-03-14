# Icon Synonyms AI Plugin - Development Plan

## Project Overview
A Figma plugin that uses AI to generate relevant synonyms for icon components and automatically adds them to component descriptions, improving searchability and usability of icon libraries. The plugin uses Figma's native UI components and allows users to preview and edit suggestions before applying them.

## Core Features
1. Description Management
   - Read existing component descriptions
   - Add new synonyms to descriptions
   - Handle both single components and component sets

2. AI Integration
   - Send icon data to AI provider
   - Process AI responses
   - Handle API errors

3. Icon Export
   - Convert Figma icons to images
   - Handle different icon styles and formats
   - Optimize images for AI processing

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
- [ ] Set up AI provider connection
- [ ] Implement prompt template
- [ ] Create response parsing
- [ ] Add error handling
- [ ] Test with sample icons

### Phase 3: Icon Export
- [ ] Implement icon-to-image conversion
- [ ] Add support for various icon styles (filled, outlined, etc.)
- [ ] Create image optimization pipeline
- [ ] Handle batch export for multiple icons
- [ ] Add export error handling
- [ ] Test with different icon types and sizes

### Phase 4: User Interface
- [ ] Set up @create-figma-plugin/ui and Preact
- [ ] Create suggestion preview interface with Figma-like components
- [ ] Add inline editing capability with native-like inputs
- [ ] Implement batch selection interface
- [ ] Add progress indicators
- [ ] Implement theme support (light/dark)

### Phase 5: Advanced Features
- [ ] Add custom prompt editor
- [ ] Implement batch processing


## File Structure
```
icons-synonyms-AI/
├── code.ts              # Main plugin logic
├── ui.tsx              # Plugin interface (Preact/create-figma-plugin-ui)
├── manifest.json       # Plugin configuration
├── styles.css         # Additional UI styling
├── src/
│   ├── ai-service.ts   # AI API integration
│   ├── description-manager.ts  # Description handling
│   ├── components/    # UI components
│   │   ├── Preview.tsx
│   │   ├── Editor.tsx
│   │   └── PromptEditor.tsx
│   └── utils.ts        # Helper functions
└── types/
    └── index.d.ts      # Type definitions
```

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
1. Set up project with Figma native UI components
2. Implement description reading/writing
3. Create basic AI integration
4. Build suggestion preview interface
5. Add batch processing support

## Technical Requirements
- Use @create-figma-plugin/ui for consistent Figma-like interface
- Preserve existing component descriptions
- Support batch processing
- Handle API rate limits
- Maintain undo/redo history
- Support custom prompt templates
- Ensure proper theme handling (light/dark)

## Notes
- Always preview before applying changes
- Keep original descriptions intact
- Track AI-generated vs user-edited synonyms
- Consider caching for batch operations
- Support offline mode for saved suggestions 
