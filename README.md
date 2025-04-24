# Icon Synonyms AI Plugin

A Figma plugin that uses AI to generate relevant synonyms for icon components and automatically adds them to component descriptions, improving searchability and usability of icon libraries.

## Features
- Generate synonyms for icons using AI
- Your own API key from OpenAI

## Development Setup

1. Install Node.js from https://nodejs.org/en/download/
2. Clone this repository
3. Install dependencies:
```bash
npm install
npm install --save-dev @figma/plugin-typings
npm install @create-figma-plugin/ui preact # New UI framework
```
4. Build and run the plugin in Figma

## Using the Plugin

1. Install the plugin from Figma Plugin Store
2. Go to the Settings tab and enter your OpenAI API key
3. Select an icon component in your design
4. Click "Generate Synonyms" to analyze the icon
5. Select the synonyms you want to add to the component
6. Click "Apply Selected" to add them to the component description

## How the Plugin Works

### Technical Workflow
1. **Icon Analysis**: When you select an icon component, the plugin:
   - Extracts the icon's visual data (SVG)
   - Analyzes existing component name and description
   - Prepares a context-rich prompt for the AI

2. **AI Processing**:
   - The plugin sends the prepared data to OpenAI's GPT-4o
   - The AI analyzes the icon's visual characteristics and semantic meaning
   - The model generates contextually relevant synonyms grouped by semantic categories

3. **Synonym Application**:
   - Generated synonyms are displayed in semantic groups
   - Users can select which synonym groups to apply
   - Selected synonyms are added to the component's description
   - Existing description is preserved and enhanced, not replaced

### Batch Processing Workflow
For multiple icon selection (coming soon):
1. Select multiple icon components in Figma
2. The plugin creates separate cards for each selected icon
3. Process each icon individually or in batch
4. Apply changes to maintain consistent description patterns

### Data Handling
- All icon processing happens locally within the plugin
- Only anonymized icon data is sent to OpenAI for analysis
- No user designs are stored or shared
- API keys are stored only on the user's device using Figma's clientStorage

## Current Status
- ✅ Component selection detection
- ✅ AI integration with OpenAI GPT-4o
- ✅ Basic UI functionality with grouped synonyms
- ✅ Synonym selection and application
- ✅ Empty description handling
- ✅ API key management in Settings page
- ✅ User-specific API key storage with clientStorage
- 🚧 Batch processing implementation
  - 🚧 Create separate cards for several selected icons
- 🚧 Add regenerate button to one icon card
- 🚧 Check layers inside for modificators
