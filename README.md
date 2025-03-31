# Icon Synonyms AI Plugin

A Figma plugin that uses AI to generate relevant synonyms for icon components and automatically adds them to component descriptions, improving searchability and usability of icon libraries.

## Features
- Generate contextually relevant synonyms for icons using AI
- Enhance component searchability 
- Improve icon library usability
- Support for both single components and batch processing
- Light/Dark theme support

## Development Setup

1. Install Node.js from https://nodejs.org/en/download/
2. Clone this repository
3. Install dependencies:
```bash
npm install
npm install --save-dev @figma/plugin-typings
npm install @create-figma-plugin/ui preact # New UI framework
```
4. Set up API keys:
   - Copy `src/config.template.ts` to `src/config.ts`
   - Copy `src/api-keys.template.ts` to `src/api-keys.ts`
   - Add your OpenAI API key to both files
   - These files are gitignored to prevent API keys from being committed

## Project Structure
```
icons-synonyms-AI/
├── code.ts              # Main plugin logic
├── code.js             # Bundled JavaScript (from esbuild)
├── ui.html             # Plugin interface
├── manifest.json       # Plugin configuration
├── src/
│   ├── ai-service.ts   # AI API integration
│   ├── api-keys.ts     # API keys (gitignored)
│   ├── icon-exporter.ts # Icon export functionality
│   └── components/     # UI components
├── esbuild.config.js   # esbuild configuration
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
- ✅ API key security
- 🚧 Batch processing implementation

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License.
