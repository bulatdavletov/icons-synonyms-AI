# Icon Synonyms AI Plugin

A Figma plugin that uses AI to generate relevant synonyms for icon components and automatically adds them to component descriptions, improving searchability and usability of icon libraries.

## Features
- Generate contextually relevant synonyms for icons using AI
- Enhance component searchability 
- Improve icon library usability
- Support for both single components and batch processing
- Light/Dark theme support
- Integrated settings page for API key management

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

## API Key Security

We take the security of API keys very seriously:

1. Each user needs to provide their own OpenAI API key through the Settings page
2. API keys are stored securely using Figma's clientStorage API, which keeps them only on the user's device
3. Keys are never transmitted to servers other than directly to OpenAI for API calls
4. The plugin validates API key formats before saving

## Using the Plugin

1. Install the plugin from Figma Plugin Store
2. Go to the Settings tab and enter your OpenAI API key
3. Select an icon component in your design
4. Click "Generate Synonyms" to analyze the icon
5. Select the synonyms you want to add to the component
6. Click "Apply Selected" to add them to the component description

## Project Structure
```
icons-synonyms-AI/
├── code.ts              # Main plugin logic
├── code.js             # Bundled JavaScript (from esbuild)
├── ui.html             # Plugin interface
├── manifest.json       # Plugin configuration
├── src/
│   ├── ai-service.ts   # AI API integration
│   ├── icon-exporter.ts # Icon export functionality
│   ├── types.ts        # TypeScript type definitions
│   └── components/     # UI components
│       ├── App.tsx     # Main application component
│       ├── ComponentInfo.tsx # Component info display
│       ├── Settings.tsx # API key settings page
│       └── SynonymGroups.tsx # Synonym groups display
├── scripts/
│   └── prebuild.js     # Build scripts
└── tsconfig.json       # TypeScript configuration
```

## Development Workflow

1. Open the directory in Visual Studio Code
2. Start the TypeScript compiler in watch mode:
```bash
npm run watch
```
3. Make your changes
4. Test in Figma by loading the plugin

## Build Process
- TypeScript files are bundled using esbuild
- Main entry point: `code.ts` → `code.js`
- UI is defined in `ui.html`
- Build command: `npm run build`
- Watch mode: `npm run watch`

## Current Status
- ✅ Component selection detection
- ✅ AI integration with OpenAI GPT-4o
- ✅ Basic UI functionality with grouped synonyms
- ✅ Synonym selection and application
- ✅ Empty description handling
- ✅ API key management in Settings page
- ✅ User-specific API key storage with clientStorage
- 🚧 Batch processing implementation

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License.
